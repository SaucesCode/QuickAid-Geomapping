# Standard library
import io
import os
from datetime import datetime, timedelta, date
from pathlib import Path
import base64
from io import BytesIO


# Django
from django.conf import settings
from django.db.models import (
    Avg, Count, ExpressionWrapper, F, DurationField,
    IntegerField, Max, Q
)
from django.db.models.functions import TruncDate, ExtractYear, TruncMonth, ExtractHour
from django.utils import timezone
from dateutil.relativedelta import relativedelta

# Data & Charts
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np

# PDF Generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, 
    Spacer, PageBreak, Image, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# Excel Generation
from openpyxl import Workbook
from openpyxl.chart import BarChart, PieChart, LineChart, Reference
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

# Local
from .models import Applicant, BackgroundInfo, StaffActivityLog
from .utils import apply_applicant_filters

def apply_common_filters(qs, filters):
    """
    Apply common filters to queryset
    Extracted from views.py to avoid circular imports
    """
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    assistance_types = filters.get('assistance_types', [])
    cities = filters.get('cities', [])
    barangays = filters.get('barangays', [])
    
    if start_date and end_date:
        qs = qs.filter(date_filled__date__range=[start_date, end_date])
    if assistance_types:
        qs = qs.filter(type_of_assistance__in=assistance_types)
    if cities:
        qs = qs.filter(background_info__barangay__city__name__in=cities)
    if barangays:
        qs = qs.filter(background_info__barangay__name__in=barangays)
    
    return qs


class AnalyticsDataCollector:
    """Collects all analytics data based on filters"""
    
    def __init__(self, filters):
        self.filters = filters
        self.start_date = filters.get('start_date')
        self.end_date = filters.get('end_date')
        self.cities = filters.get('cities', [])
        self.barangays = filters.get('barangays', [])
        self.assistance_types = filters.get('assistance_types', [])
        
    def _get_base_queryset(self):
        """Get base applicant queryset with filters applied"""
        qs = Applicant.objects.filter(is_archived=False)
        
        if self.start_date and self.end_date:
            qs = qs.filter(date_filled__date__range=[self.start_date, self.end_date])
        if self.assistance_types:
            qs = qs.filter(type_of_assistance__in=self.assistance_types)
        if self.cities:
            qs = qs.filter(background_info__barangay__city__name__in=self.cities)
        if self.barangays:
            qs = qs.filter(background_info__barangay__name__in=self.barangays)
            
        return qs
    
    def collect_summary_metrics(self):
        """Dashboard KPIs"""
        base_qs = self._get_base_queryset()
        total = base_qs.count()
        
        # Average processing time
        avg_time = base_qs.exclude(
            created_at__isnull=True, date_filled__isnull=True
        ).aggregate(
            avg_time=Avg(ExpressionWrapper(
                F('date_filled') - F('created_at'),
                output_field=DurationField()
            ))
        )['avg_time']
        avg_minutes = round(avg_time.total_seconds() / 60, 1) if avg_time else 0
        
        # Most common assistance type
        most_common = base_qs.values('type_of_assistance').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        # Top barangay
        top_barangay = base_qs.values('background_info__barangay__name').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        # Growth rate
        today = timezone.localdate()
        start_of_this_month = today.replace(day=1)
        start_of_last_month = (start_of_this_month - timedelta(days=1)).replace(day=1)
        end_of_last_month = start_of_this_month - timedelta(days=1)
        
        this_month = base_qs.filter(date_filled__date__gte=start_of_this_month).count()
        last_month = base_qs.filter(
            date_filled__date__range=[start_of_last_month, end_of_last_month]
        ).count()
        growth_rate = ((this_month - last_month) / last_month * 100) if last_month > 0 else 0
        
        return {
            'total_applicants': total,
            'avg_processing_minutes': avg_minutes,
            'most_common_type': most_common['type_of_assistance'] if most_common else 'N/A',
            'top_barangay': top_barangay['background_info__barangay__name'] if top_barangay else 'N/A',
            'growth_rate': round(growth_rate, 2),
            'this_month': this_month,
            'last_month': last_month
        }
    
    def collect_geographic_data(self):
        """Geographic insights"""
        base_qs = self._get_base_queryset()
        
        # Top 10 barangays
        top_barangays = list(
            base_qs.values('background_info__barangay__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # By city
        by_city = list(
            base_qs.values('background_info__barangay__city__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Approval rates by location
        by_location = list(
            base_qs.values('background_info__barangay__city__name')
            .annotate(
                total=Count('id'),
                approved=Count('id', filter=Q(approvals__isnull=False))
            )
            .order_by('-total')
        )
        
        return {
            'top_barangays': top_barangays,
            'by_city': by_city,
            'approval_by_location': by_location
        }
    
    def collect_demographic_data(self):
        """Demographics analysis"""
        base_qs = self._get_base_queryset()
        today = date.today()
        
        # Gender
        by_gender = list(
            base_qs.values('background_info__sex')
            .annotate(count=Count('id'))
        )
        
        # Civil status
        by_civil_status = list(
            base_qs.values('background_info__civil_status')
            .annotate(count=Count('id'))
        )
        
        # Age groups
        qs_with_age = base_qs.annotate(
            age=ExpressionWrapper(
                today.year - ExtractYear('background_info__birthday'),
                output_field=IntegerField()
            )
        )
        age_groups = {
            '0-17': qs_with_age.filter(age__lte=17).count(),
            '18-25': qs_with_age.filter(age__gte=18, age__lte=25).count(),
            '26-35': qs_with_age.filter(age__gte=26, age__lte=35).count(),
            '36-45': qs_with_age.filter(age__gte=36, age__lte=45).count(),
            '46-60': qs_with_age.filter(age__gte=46, age__lte=60).count(),
            '60+': qs_with_age.filter(age__gt=60).count(),
        }
        
        # Occupation
        by_occupation = list(
            base_qs.values('background_info__occupation')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        return {
            'by_gender': by_gender,
            'by_civil_status': by_civil_status,
            'age_groups': age_groups,
            'by_occupation': by_occupation
        }
    
    def collect_economic_data(self):
        """Economic analysis"""
        base_qs = self._get_base_queryset().exclude(background_info__monthly_income=0)
        
        income_ranges = [
            (0, 10000, 'Below 10,000'),
            (10001, 20000, '10,001 - 20,000'),
            (20001, 30000, '20,001 - 30,000'),
            (30001, 40000, '30,001 - 40,000'),
            (40001, 50000, '40,001 - 50,000'),
            (50001, 100000, '50,001 - 100,000'),
            (100001, None, 'Above 100,000')
        ]
        
        distribution = []
        for min_income, max_income, label in income_ranges:
            if max_income is None:
                count = base_qs.filter(background_info__monthly_income__gte=min_income).count()
            else:
                count = base_qs.filter(
                    background_info__monthly_income__gte=min_income,
                    background_info__monthly_income__lt=max_income
                ).count()
            distribution.append({'range': label, 'count': count})
        
        return {'income_distribution': distribution}
    
    def collect_trends_data(self):
        """Trends over time"""
        base_qs = self._get_base_queryset()
        
        # Monthly trends (last 12 months)
        today = timezone.now().date()
        start_date = today.replace(day=1) - relativedelta(months=11)
        monthly = list(
            base_qs.filter(date_filled__gte=start_date)
            .annotate(month=TruncMonth('date_filled'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Yearly trends
        yearly = list(
            base_qs.annotate(year=ExtractYear('date_filled'))
            .values('year')
            .annotate(count=Count('id'))
            .order_by('year')
        )
        
        # Assistance type distribution
        by_assistance = list(
            base_qs.values('type_of_assistance')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Assistance types over time (monthly)
        assistance_over_time = list(
            base_qs.annotate(month=TruncMonth('date_filled'))
            .values('month', 'type_of_assistance')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        return {
            'monthly': monthly,
            'yearly': yearly,
            'by_assistance': by_assistance,
            'assistance_over_time': assistance_over_time
        }
    
    def collect_performance_data(self):
        """Performance & productivity metrics"""
        base_qs = self._get_base_queryset()
        
        # Staff productivity
        staff_productivity = list(
            base_qs.values('staff__username')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Processing time by assistance type
        processing_by_type = list(
            base_qs.exclude(created_at__isnull=True, date_filled__isnull=True)
            .annotate(
                duration=ExpressionWrapper(
                    F('date_filled') - F('created_at'),
                    output_field=DurationField()
                )
            )
            .values('type_of_assistance')
            .annotate(avg_time=Avg('duration'))
        )
        
        for item in processing_by_type:
            if item['avg_time']:
                item['avg_minutes'] = round(item['avg_time'].total_seconds() / 60, 1)
            else:
                item['avg_minutes'] = 0  # ensure the key exists
            
        # Activity heatmap (by hour)
        activity_heatmap = list(
            base_qs.annotate(hour=ExtractHour('date_filled'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        
        return {
            'staff_productivity': staff_productivity,
            'processing_by_type': processing_by_type,
            'activity_heatmap': activity_heatmap
        }
    
    def collect_all(self):
        """Collect all analytics data"""
        return {
            'summary': self.collect_summary_metrics(),
            'geographic': self.collect_geographic_data(),
            'demographics': self.collect_demographic_data(),
            'economics': self.collect_economic_data(),
            'trends': self.collect_trends_data(),
            'performance': self.collect_performance_data()
        }


class InsightsGenerator:
    """Generates narrative insights from analytics data"""
    
    def __init__(self, data):
        self.data = data
    
    def generate_executive_summary(self):
        """Generate high-level summary"""
        summary = self.data['summary']
        
        insights = []
        insights.append(
            f"During the reporting period, a total of {summary['total_applicants']:,} "
            f"applicants were processed with an average processing time of "
            f"{summary['avg_processing_minutes']} minutes per application."
        )
        
        if summary['growth_rate'] > 0:
            insights.append(
                f"Applications showed a {summary['growth_rate']}% increase compared to "
                f"the previous month ({summary['this_month']} vs {summary['last_month']})."
            )
        elif summary['growth_rate'] < 0:
            insights.append(
                f"Applications decreased by {abs(summary['growth_rate'])}% compared to "
                f"the previous month ({summary['this_month']} vs {summary['last_month']})."
            )
        else:
            insights.append("Applications remained stable compared to the previous month.")
        
        insights.append(
            f"The most requested assistance type was {summary['most_common_type']}, "
            f"with {summary['top_barangay']} recording the highest number of applications."
        )
        
        return " ".join(insights)
    
    def generate_geographic_insights(self):
        """Generate geographic insights"""
        geo = self.data['geographic']
        insights = []
        
        if geo['top_barangays']:
            top = geo['top_barangays'][0]
            insights.append(
                f"• {top['background_info__barangay__name']} leads with {top['count']} applications"
            )
        
        if len(geo['by_city']) > 1:
            cities_sorted = sorted(geo['by_city'], key=lambda x: x['count'], reverse=True)
            top_city = cities_sorted[0]
            insights.append(
                f"• {top_city['background_info__barangay__city__name']} has the highest city-wide "
                f"applications with {top_city['count']} total"
            )
        
        # Approval rate analysis
        if geo['approval_by_location']:
            for loc in geo['approval_by_location'][:3]:
                if loc['total'] > 0:
                    rate = (loc['approved'] / loc['total']) * 100
                    insights.append(
                        f"• {loc['background_info__barangay__city__name']}: "
                        f"{rate:.1f}% approval rate ({loc['approved']}/{loc['total']})"
                    )
        
        return insights
    
    def generate_demographic_insights(self):
        """Generate demographic insights"""
        demo = self.data['demographics']
        insights = []
        
        # Gender distribution
        if demo['by_gender']:
            gender_sorted = sorted(demo['by_gender'], key=lambda x: x['count'], reverse=True)
            total = sum(g['count'] for g in gender_sorted)
            if total > 0:
                top_gender = gender_sorted[0]
                pct = (top_gender['count'] / total) * 100
                insights.append(
                    f"• {top_gender['background_info__sex']} applicants comprise {pct:.1f}% "
                    f"of total applications"
                )
        
        # Age groups
        age_groups = demo['age_groups']
        if age_groups:
            dominant_age = max(age_groups.items(), key=lambda x: x[1])
            insights.append(
                f"• Age group {dominant_age[0]} is most represented with {dominant_age[1]} applicants"
            )
        
        # Civil status
        if demo['by_civil_status']:
            civil_sorted = sorted(demo['by_civil_status'], key=lambda x: x['count'], reverse=True)
            if civil_sorted:
                insights.append(
                    f"• {civil_sorted[0]['background_info__civil_status']} applicants: "
                    f"{civil_sorted[0]['count']}"
                )
        
        return insights
    
    def generate_trend_insights(self):
        """Generate trend insights"""
        trends = self.data['trends']
        insights = []
        
        # Monthly trend analysis
        if len(trends['monthly']) >= 2:
            latest = trends['monthly'][-1]['count']
            previous = trends['monthly'][-2]['count']
            change = ((latest - previous) / previous * 100) if previous > 0 else 0
            
            if change > 10:
                insights.append(f"• Strong growth: Applications increased {change:.1f}% month-over-month")
            elif change < -10:
                insights.append(f"• Declining trend: Applications decreased {abs(change):.1f}% month-over-month")
            else:
                insights.append("• Stable trend: Applications remain consistent month-over-month")
        
        # Assistance type trends
        if trends['by_assistance']:
            top_3 = trends['by_assistance'][:3]
            insights.append("• Top assistance types: " + ", ".join(
                f"{t['type_of_assistance']} ({t['count']})" for t in top_3
            ))
        
        return insights
    
    def generate_performance_insights(self):
        """Generate performance insights"""
        perf = self.data['performance']
        insights = []
        
        # Staff productivity
        if perf['staff_productivity']:
            top_staff = perf['staff_productivity'][0]
            insights.append(
                f"• Most productive staff: {top_staff['staff__username']} "
                f"({top_staff['count']} applications processed)"
            )
        
        # Processing time analysis
        if perf['processing_by_type']:
            fastest = min(perf['processing_by_type'], key=lambda x: x.get('avg_minutes', float('inf')))
            slowest = max(perf['processing_by_type'], key=lambda x: x.get('avg_minutes', 0))
            
            insights.append(
                f"• Fastest processing: {fastest['type_of_assistance']} "
                f"({fastest.get('avg_minutes', 0):.1f} min avg)"
            )
            insights.append(
                f"• Slowest processing: {slowest['type_of_assistance']} "
                f"({slowest.get('avg_minutes', 0):.1f} min avg)"
            )
        
        # Peak hours
        if perf['activity_heatmap']:
            peak_hour = max(perf['activity_heatmap'], key=lambda x: x['count'])
            insights.append(
                f"• Peak application hour: {peak_hour['hour']}:00 ({peak_hour['count']} applications)"
            )
        
        return insights
    
    def generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []
        summary = self.data['summary']
        
        # Processing time recommendations
        if summary['avg_processing_minutes'] > 10:
            recommendations.append(
                "• Consider streamlining the application process to reduce processing time"
            )
        
        # Geographic recommendations
        geo = self.data['geographic']
        if geo['top_barangays'] and len(geo['top_barangays']) > 0:
            top = geo['top_barangays'][0]
            recommendations.append(
                f"• Allocate additional resources to {top['background_info__barangay__name']} "
                f"due to high application volume"
            )
        
        # Growth recommendations
        if summary['growth_rate'] > 20:
            recommendations.append(
                "• Rapid growth detected - ensure adequate staffing and resources"
            )
        
        return recommendations
    
    def generate_all(self):
        """Generate all insights"""
        return {
            'executive_summary': self.generate_executive_summary(),
            'geographic': self.generate_geographic_insights(),
            'demographic': self.generate_demographic_insights(),
            'trends': self.generate_trend_insights(),
            'performance': self.generate_performance_insights(),
            'recommendations': self.generate_recommendations()
        }


class ChartGenerator:
    """Generates all chart visualizations"""
    
    def __init__(self):
        # Set consistent style
        plt.style.use('seaborn-v0_8-darkgrid')
        self.primary_color = '#0066cc'
        self.colors = ['#0066cc', '#00cc66', '#cc6600', '#cc0066', '#6600cc', '#00cccc']
    
    def create_bar_chart(self, data, x_field, y_field, title, xlabel, ylabel, top_n=10):
        """Generic bar chart creator"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Sort and limit data
        sorted_data = sorted(data, key=lambda x: x[y_field], reverse=True)[:top_n]
        
        x_values = [str(item[x_field]) for item in sorted_data]
        y_values = [item[y_field] for item in sorted_data]
        
        bars = ax.bar(x_values, y_values, color=self.primary_color, alpha=0.8)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{int(height)}',
                   ha='center', va='bottom', fontsize=9)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.set_xlabel(xlabel, fontsize=11)
        ax.set_ylabel(ylabel, fontsize=11)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        return fig
    
    def create_pie_chart(self, data, label_field, value_field, title):
        """Generic pie chart creator"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        labels = [str(item[label_field]) for item in data]
        values = [item[value_field] for item in data]
        
        # Filter out zero values
        filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
        if not filtered:
            plt.close(fig)
            return None
        
        labels, values = zip(*filtered)
        
        wedges, texts, autotexts = ax.pie(
            values, labels=labels, autopct='%1.1f%%',
            colors=self.colors[:len(values)], startangle=90
        )
        
        # Improve text visibility
        for text in texts:
            text.set_fontsize(10)
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(9)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        plt.tight_layout()
        
        return fig
    
    def create_line_chart(self, data, x_field, y_field, title, xlabel, ylabel):
        """Generic line chart creator"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        sorted_data = sorted(data, key=lambda x: x[x_field])
        x_values = [item[x_field] for item in sorted_data]
        y_values = [item[y_field] for item in sorted_data]
        
        ax.plot(x_values, y_values, marker='o', color=self.primary_color, 
                linewidth=2, markersize=6)
        
        # Add value labels
        for x, y in zip(x_values, y_values):
            ax.text(x, y, str(y), ha='center', va='bottom', fontsize=8)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.set_xlabel(xlabel, fontsize=11)
        ax.set_ylabel(ylabel, fontsize=11)
        ax.grid(True, alpha=0.3)
        
        # Format x-axis for dates
        if isinstance(x_values[0], datetime):
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
            plt.xticks(rotation=45)
        
        plt.tight_layout()
        return fig
    
    def create_stacked_bar_chart(self, data, title):
        """Stacked bar chart for assistance types over time"""
        fig, ax = plt.subplots(figsize=(14, 7))
        
        # Organize data by month and type
        months = sorted(set(item['month'] for item in data))
        types = sorted(set(item['type_of_assistance'] for item in data))
        
        # Create data matrix
        data_matrix = {t: [] for t in types}
        for month in months:
            for t in types:
                count = next((item['count'] for item in data 
                            if item['month'] == month and item['type_of_assistance'] == t), 0)
                data_matrix[t].append(count)
        
        # Plot stacked bars
        bottom = np.zeros(len(months))
        for idx, t in enumerate(types):
            ax.bar([m.strftime('%b %Y') if hasattr(m, 'strftime') else str(m) for m in months],
                  data_matrix[t], bottom=bottom, label=t, 
                  color=self.colors[idx % len(self.colors)])
            bottom += np.array(data_matrix[t])
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.set_xlabel('Month', fontsize=11)
        ax.set_ylabel('Number of Applications', fontsize=11)
        ax.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        return fig
    
    def create_heatmap(self, data, title):
        """Heatmap for hourly activity"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        hours = list(range(24))
        counts = [0] * 24
        
        for item in data:
            counts[item['hour']] = item['count']
        
        # Create heatmap-style bar chart
        colors_map = plt.cm.Blues(np.linspace(0.3, 1, 24))
        bars = ax.bar(hours, counts, color=colors_map, edgecolor='black', linewidth=0.5)
        
        # Add value labels
        for bar in bars:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{int(height)}', ha='center', va='bottom', fontsize=8)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.set_xlabel('Hour of Day', fontsize=11)
        ax.set_ylabel('Number of Applications', fontsize=11)
        ax.set_xticks(hours)
        ax.set_xticklabels([f'{h:02d}:00' for h in hours], rotation=45, ha='right')
        plt.tight_layout()
        
        return fig
    
    def generate_all_charts(self, data):
        """Generate all charts and return as dict of figures"""
        charts = {}
        
        # Geographic charts
        if data['geographic']['top_barangays']:
            charts['top_barangays'] = self.create_bar_chart(
                data['geographic']['top_barangays'],
                'background_info__barangay__name', 'count',
                'Top 10 Barangays by Applications',
                'Barangay', 'Number of Applications'
            )
        
        if data['geographic']['by_city']:
            charts['by_city'] = self.create_pie_chart(
                data['geographic']['by_city'],
                'background_info__barangay__city__name', 'count',
                'Applications by City'
            )
        
        # Demographic charts
        if data['demographics']['by_gender']:
            charts['by_gender'] = self.create_pie_chart(
                data['demographics']['by_gender'],
                'background_info__sex', 'count',
                'Applications by Gender'
            )
        
        if data['demographics']['age_groups']:
            age_data = [{'group': k, 'count': v} for k, v in data['demographics']['age_groups'].items()]
            charts['age_groups'] = self.create_bar_chart(
                age_data, 'group', 'count',
                'Applications by Age Group',
                'Age Group', 'Number of Applications'
            )
        
        if data['demographics']['by_civil_status']:
            charts['civil_status'] = self.create_bar_chart(
                data['demographics']['by_civil_status'],
                'background_info__civil_status', 'count',
                'Applications by Civil Status',
                'Civil Status', 'Number of Applications'
            )
        
        # Economic charts
        if data['economics']['income_distribution']:
            charts['income'] = self.create_bar_chart(
                data['economics']['income_distribution'],
                'range', 'count',
                'Income Distribution',
                'Income Range (PHP)', 'Number of Applicants'
            )
        
        # Trends charts
        if data['trends']['monthly']:
            charts['monthly_trend'] = self.create_line_chart(
                data['trends']['monthly'],
                'month', 'count',
                'Monthly Application Trends (Last 12 Months)',
                'Month', 'Number of Applications'
            )
        
        if data['trends']['yearly']:
            charts['yearly_trend'] = self.create_bar_chart(
                data['trends']['yearly'],
                'year', 'count',
                'Yearly Application Trends',
                'Year', 'Number of Applications', top_n=20
            )
        
        if data['trends']['by_assistance']:
            charts['assistance_types'] = self.create_bar_chart(
                data['trends']['by_assistance'],
                'type_of_assistance', 'count',
                'Applications by Assistance Type',
                'Type of Assistance', 'Number of Applications'
            )
        
        if data['trends']['assistance_over_time']:
            charts['assistance_over_time'] = self.create_stacked_bar_chart(
                data['trends']['assistance_over_time'],
                'Assistance Types Over Time'
            )
        
        # Performance charts
        if data['performance']['staff_productivity']:
            charts['staff_productivity'] = self.create_bar_chart(
                data['performance']['staff_productivity'],
                'staff__username', 'count',
                'Staff Productivity (Top 10)',
                'Staff Member', 'Applications Processed'
            )
        
        if data['performance']['processing_by_type']:
            charts['processing_time'] = self.create_bar_chart(
                data['performance']['processing_by_type'],
                'type_of_assistance', 'avg_minutes',
                'Average Processing Time by Assistance Type',
                'Type of Assistance', 'Average Time (minutes)'
            )
        
        if data['performance']['activity_heatmap']:
            charts['activity_heatmap'] = self.create_heatmap(
                data['performance']['activity_heatmap'],
                'Application Activity by Hour of Day'
            )
        
        return charts


class PDFReportGenerator:
    """Generates PDF report with charts and insights"""
    
    def __init__(self, data, insights, charts, branding, filters):
        self.data = data
        self.insights = insights
        self.charts = charts
        self.branding = branding
        self.filters = filters
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor(self.branding.get('primary_color', '#0066cc')),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor(self.branding.get('primary_color', '#0066cc')),
            spaceAfter=12,
            spaceBefore=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='Insight',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            leftIndent=20
        ))
    
    def _save_chart_to_buffer(self, fig):
        """Save matplotlib figure to buffer"""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf
    
    def _create_cover_page(self):
        """Create report cover page"""
        elements = []
        
        # Logo (if provided)
        logo_url = self.branding.get('logo_url')
        if logo_url and os.path.exists(logo_url):
            logo = Image(logo_url, width=2*inch, height=2*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 0.5*inch))
        
        # Title
        title = Paragraph(
            self.branding.get('organization_name', 'Analytics Report'),
            self.styles['CustomTitle']
        )
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Subtitle
        subtitle = Paragraph(
            "Comprehensive Analytics Report",
            self.styles['Heading2']
        )
        subtitle.alignment = TA_CENTER
        elements.append(subtitle)
        elements.append(Spacer(1, 0.5*inch))
        
        # Report metadata
        metadata = [
            ['Report Period:', f"{self.filters.get('start_date', 'All')} to {self.filters.get('end_date', 'All')}"],
            ['Generated:', datetime.now().strftime('%B %d, %Y at %H:%M')],
            ['Total Applicants:', f"{self.data['summary']['total_applicants']:,}"],
        ]
        
        if self.filters.get('cities'):
            metadata.append(['Filtered Cities:', ', '.join(self.filters['cities'])])
        if self.filters.get('assistance_types'):
            metadata.append(['Assistance Types:', ', '.join(self.filters['assistance_types'])])
        
        table = Table(metadata, colWidths=[2.5*inch, 4*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(table)
        
        elements.append(PageBreak())
        return elements
    
    def _create_executive_summary(self):
        """Create executive summary section"""
        elements = []
        
        elements.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Summary text
        summary_text = Paragraph(self.insights['executive_summary'], self.styles['Normal'])
        elements.append(summary_text)
        elements.append(Spacer(1, 0.3*inch))
        
        # Key metrics table
        summary = self.data['summary']
        metrics = [
            ['Metric', 'Value'],
            ['Total Applicants', f"{summary['total_applicants']:,}"],
            ['Avg Processing Time', f"{summary['avg_processing_minutes']} minutes"],
            ['Growth Rate', f"{summary['growth_rate']}%"],
            ['Most Common Type', summary['most_common_type']],
            ['Top Barangay', summary['top_barangay']],
        ]
        
        table = Table(metrics, colWidths=[3*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(self.branding.get('primary_color', '#0066cc'))),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)
        
        elements.append(PageBreak())
        return elements
    
    def _create_section_with_chart(self, title, insights_list, chart_key):
        """Create a section with insights and chart"""
        elements = []
        
        elements.append(Paragraph(title, self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.1*inch))
        
        # Add insights
        if insights_list:
            for insight in insights_list:
                elements.append(Paragraph(insight, self.styles['Insight']))
            elements.append(Spacer(1, 0.2*inch))
        
        # Add chart
        if chart_key in self.charts:
            buf = self._save_chart_to_buffer(self.charts[chart_key])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
        
        elements.append(Spacer(1, 0.3*inch))
        return elements
    
    def _create_geographic_section(self):
        """Create geographic analysis section"""
        elements = []
        elements.append(Paragraph("Geographic Analysis", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        for insight in self.insights['geographic']:
            elements.append(Paragraph(insight, self.styles['Insight']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Top barangays chart
        if 'top_barangays' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['top_barangays'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.2*inch))
        
        # City distribution chart
        if 'by_city' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['by_city'])
            img = Image(buf, width=6.5*inch, height=5*inch)
            elements.append(img)
        
        elements.append(PageBreak())
        return elements
    
    def _create_demographic_section(self):
        """Create demographic analysis section"""
        elements = []
        elements.append(Paragraph("Demographic Analysis", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        for insight in self.insights['demographic']:
            elements.append(Paragraph(insight, self.styles['Insight']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Gender chart
        if 'by_gender' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['by_gender'])
            img = Image(buf, width=6*inch, height=4.5*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.2*inch))
        
        # Age groups chart
        if 'age_groups' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['age_groups'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
        
        elements.append(PageBreak())
        return elements
    
    def _create_trends_section(self):
        """Create trends analysis section"""
        elements = []
        elements.append(Paragraph("Trends Analysis", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        for insight in self.insights['trends']:
            elements.append(Paragraph(insight, self.styles['Insight']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Monthly trend
        if 'monthly_trend' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['monthly_trend'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.2*inch))
        
        # Assistance types
        if 'assistance_types' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['assistance_types'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
        
        elements.append(PageBreak())
        return elements
    
    def _create_performance_section(self):
        """Create performance analysis section"""
        elements = []
        elements.append(Paragraph("Performance & Productivity", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        for insight in self.insights['performance']:
            elements.append(Paragraph(insight, self.styles['Insight']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Staff productivity
        if 'staff_productivity' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['staff_productivity'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.2*inch))
        
        # Activity heatmap
        if 'activity_heatmap' in self.charts:
            buf = self._save_chart_to_buffer(self.charts['activity_heatmap'])
            img = Image(buf, width=6.5*inch, height=4*inch)
            elements.append(img)
        
        elements.append(PageBreak())
        return elements
    
    def _create_recommendations(self):
        """Create recommendations section"""
        elements = []
        elements.append(Paragraph("Recommendations", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        for rec in self.insights['recommendations']:
            elements.append(Paragraph(rec, self.styles['Insight']))
        
        return elements
    
    def generate(self, output_path):
        """Generate complete PDF report"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        
        # Build report sections
        story.extend(self._create_cover_page())
        story.extend(self._create_executive_summary())
        story.extend(self._create_geographic_section())
        story.extend(self._create_demographic_section())
        
        # Economic section
        if 'income' in self.charts:
            story.extend(self._create_section_with_chart(
                "Economic Analysis",
                ["• Income distribution across applicant base"],
                'income'
            ))
            story.append(PageBreak())
        
        story.extend(self._create_trends_section())
        story.extend(self._create_performance_section())
        story.extend(self._create_recommendations())
        
        # Build PDF
        doc.build(story)


class ExcelReportGenerator:
    """Generates Excel report with charts and data"""
    
    def __init__(self, data, insights, charts, branding, filters):
        self.data = data
        self.insights = insights
        self.charts = charts
        self.branding = branding
        self.filters = filters
        self.wb = Workbook()
        
        # Define styles
        self.header_fill = PatternFill(
            start_color=self.branding.get('primary_color', '0066cc').replace('#', ''),
            end_color=self.branding.get('primary_color', '0066cc').replace('#', ''),
            fill_type='solid'
        )
        self.header_font = Font(bold=True, color='FFFFFF', size=12)
        self.title_font = Font(bold=True, size=14)
        self.border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
    
    def _add_summary_sheet(self):
        """Add executive summary sheet"""
        ws = self.wb.active
        ws.title = "Executive Summary"
        
        # Title
        ws['A1'] = self.branding.get('organization_name', 'Analytics Report')
        ws['A1'].font = Font(bold=True, size=18)
        ws.merge_cells('A1:D1')
        
        ws['A2'] = "Comprehensive Analytics Report"
        ws['A2'].font = Font(size=12)
        ws.merge_cells('A2:D2')
        
        # Metadata
        row = 4
        ws[f'A{row}'] = "Report Period:"
        ws[f'B{row}'] = f"{self.filters.get('start_date', 'All')} to {self.filters.get('end_date', 'All')}"
        row += 1
        ws[f'A{row}'] = "Generated:"
        ws[f'B{row}'] = datetime.now().strftime('%B %d, %Y at %H:%M')
        row += 2
        
        # Key metrics
        ws[f'A{row}'] = "Key Metrics"
        ws[f'A{row}'].font = self.title_font
        row += 1
        
        summary = self.data['summary']
        metrics = [
            ['Metric', 'Value'],
            ['Total Applicants', summary['total_applicants']],
            ['Avg Processing Time (min)', summary['avg_processing_minutes']],
            ['Growth Rate (%)', summary['growth_rate']],
            ['Most Common Type', summary['most_common_type']],
            ['Top Barangay', summary['top_barangay']],
        ]
        
        for metric_row in metrics:
            ws.append(metric_row)
        
        # Style header row
        for cell in ws[row]:
            cell.fill = self.header_fill
            cell.font = self.header_font
            cell.border = self.border
        
        # Style data rows
        for r in range(row + 1, row + len(metrics)):
            for cell in ws[r]:
                cell.border = self.border
        
        # Executive summary text
        row += len(metrics) + 2
        ws[f'A{row}'] = "Executive Summary"
        ws[f'A{row}'].font = self.title_font
        row += 1
        ws[f'A{row}'] = self.insights['executive_summary']
        ws[f'A{row}'].alignment = Alignment(wrap_text=True)
        ws.merge_cells(f'A{row}:D{row + 3}')
        
        # Adjust column widths
        ws.column_dimensions['A'].width = 25
        ws.column_dimensions['B'].width = 30
        ws.column_dimensions['C'].width = 20
        ws.column_dimensions['D'].width = 20
    
    def _add_data_sheet(self, sheet_name, data, headers):
        """Generic method to add data sheet"""
        ws = self.wb.create_sheet(sheet_name)
        
        # Add headers
        ws.append(headers)
        for cell in ws[1]:
            cell.fill = self.header_fill
            cell.font = self.header_font
            cell.border = self.border
            cell.alignment = Alignment(horizontal='center')
        
        # Add data
        for row_data in data:
            ws.append(row_data)
        
        # Apply borders to all data
        for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
            for cell in row:
                cell.border = self.border
        
        # Auto-fit columns
        for column in ws.columns:
            max_length = 0
            column_letter = get_column_letter(column[0].column)
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
    
    def _add_geographic_sheet(self):
        """Add geographic data sheet"""
        geo = self.data['geographic']
        
        # Top barangays
        data = [[item['background_info__barangay__name'], item['count']] 
                for item in geo['top_barangays']]
        self._add_data_sheet('Geographic - Barangays', data, ['Barangay', 'Applications'])
        
        # By city
        data = [[item['background_info__barangay__city__name'], item['count']] 
                for item in geo['by_city']]
        self._add_data_sheet('Geographic - Cities', data, ['City', 'Applications'])
    
    def _add_demographic_sheet(self):
        """Add demographic data sheet"""
        demo = self.data['demographics']
        
        # Gender
        data = [[item['background_info__sex'], item['count']] 
                for item in demo['by_gender']]
        self._add_data_sheet('Demographics - Gender', data, ['Gender', 'Count'])
        
        # Age groups
        data = [[k, v] for k, v in demo['age_groups'].items()]
        self._add_data_sheet('Demographics - Age', data, ['Age Group', 'Count'])
        
        # Civil status
        data = [[item['background_info__civil_status'], item['count']] 
                for item in demo['by_civil_status']]
        self._add_data_sheet('Demographics - Civil Status', data, ['Civil Status', 'Count'])
    
    def _add_trends_sheet(self):
        """Add trends data sheet"""
        trends = self.data['trends']
        
        # Monthly trends
        data = [[item['month'].strftime('%Y-%m') if hasattr(item['month'], 'strftime') else str(item['month']), 
                item['count']] 
                for item in trends['monthly']]
        self._add_data_sheet('Trends - Monthly', data, ['Month', 'Applications'])
        
        # By assistance type
        data = [[item['type_of_assistance'], item['count']] 
                for item in trends['by_assistance']]
        self._add_data_sheet('Trends - Assistance Types', data, ['Type', 'Applications'])
    
    def _add_performance_sheet(self):
        """Add performance data sheet"""
        perf = self.data['performance']
        
        # Staff productivity
        data = [[item['staff__username'], item['count']] 
                for item in perf['staff_productivity']]
        self._add_data_sheet('Performance - Staff', data, ['Staff Member', 'Applications Processed'])
        
        # Processing time by type
        data = [[item['type_of_assistance'], item.get('avg_minutes', 0)] 
                for item in perf['processing_by_type']]
        self._add_data_sheet('Performance - Processing Time', data, ['Type', 'Avg Time (min)'])
    
    def _add_insights_sheet(self):
        """Add insights sheet"""
        ws = self.wb.create_sheet("Insights & Recommendations")
        
        row = 1
        
        # Geographic insights
        ws[f'A{row}'] = "Geographic Insights"
        ws[f'A{row}'].font = self.title_font
        row += 1
        for insight in self.insights['geographic']:
            ws[f'A{row}'] = insight
            row += 1
        row += 1
        
        # Demographic insights
        ws[f'A{row}'] = "Demographic Insights"
        ws[f'A{row}'].font = self.title_font
        row += 1
        for insight in self.insights['demographic']:
            ws[f'A{row}'] = insight
            row += 1
        row += 1
        
        # Trend insights
        ws[f'A{row}'] = "Trend Insights"
        ws[f'A{row}'].font = self.title_font
        row += 1
        for insight in self.insights['trends']:
            ws[f'A{row}'] = insight
            row += 1
        row += 1
        
        # Performance insights
        ws[f'A{row}'] = "Performance Insights"
        ws[f'A{row}'].font = self.title_font
        row += 1
        for insight in self.insights['performance']:
            ws[f'A{row}'] = insight
            row += 1
        row += 2
        
        # Recommendations
        ws[f'A{row}'] = "Recommendations"
        ws[f'A{row}'].font = self.title_font
        row += 1
        for rec in self.insights['recommendations']:
            ws[f'A{row}'] = rec
            row += 1
        
        ws.column_dimensions['A'].width = 100
        for cell in ws['A']:
            cell.alignment = Alignment(wrap_text=True)
    
    def generate(self, output_path):
        """Generate complete Excel report"""
        self._add_summary_sheet()
        self._add_geographic_sheet()
        self._add_demographic_sheet()
        self._add_trends_sheet()
        self._add_performance_sheet()
        self._add_insights_sheet()
        
        self.wb.save(output_path)


class ExportOrchestrator:
    """Orchestrates the entire export process"""
    
    def __init__(self, filters, user, format_type='both'):
        self.filters = filters
        self.user = user
        self.format_type = format_type
        self.branding = filters.get('branding', {})
        
        # Set default branding
        if 'organization_name' not in self.branding:
            self.branding['organization_name'] = 'DSWD Quezon Province'
        if 'primary_color' not in self.branding:
            self.branding['primary_color'] = '#0066cc'
    
    def generate_report(self):
        """Generate the complete analytics report and return as base64"""
        try:
            # Step 1: Collect all data
            collector = AnalyticsDataCollector(self.filters)
            data = collector.collect_all()
            
            # Step 2: Generate insights
            insights_gen = InsightsGenerator(data)
            insights = insights_gen.generate_all()
            
            # Step 3: Generate charts
            chart_gen = ChartGenerator()
            charts = chart_gen.generate_all_charts(data)
            
            # Step 4: Prepare results
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            results = {
                'success': True,
                'files': {},
                'metadata': {
                    'generated_at': datetime.now().isoformat(),
                    'generated_by': self.user.username,
                    'total_applicants': data['summary']['total_applicants'],
                    'date_range': f"{self.filters.get('start_date', 'All')} to {self.filters.get('end_date', 'All')}"
                }
            }
            
            # Step 5: Generate PDF in memory
            if self.format_type in ['pdf', 'both']:
                pdf_buffer = BytesIO()
                pdf_gen = PDFReportGenerator(data, insights, charts, self.branding, self.filters)
                
                # Build PDF document
                doc = SimpleDocTemplate(
                    pdf_buffer,
                    pagesize=letter,
                    rightMargin=0.75*inch,
                    leftMargin=0.75*inch,
                    topMargin=0.75*inch,
                    bottomMargin=0.75*inch
                )
                
                story = []
                story.extend(pdf_gen._create_cover_page())
                story.extend(pdf_gen._create_executive_summary())
                story.extend(pdf_gen._create_geographic_section())
                story.extend(pdf_gen._create_demographic_section())
                
                if 'income' in charts:
                    story.extend(pdf_gen._create_section_with_chart(
                        "Economic Analysis",
                        ["• Income distribution across applicant base"],
                        'income'
                    ))
                    story.append(PageBreak())
                
                story.extend(pdf_gen._create_trends_section())
                story.extend(pdf_gen._create_performance_section())
                story.extend(pdf_gen._create_recommendations())
                
                doc.build(story)
                
                # Convert to base64
                pdf_buffer.seek(0)
                pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
                
                results['files']['pdf'] = {
                    'filename': f'analytics_report_{timestamp}.pdf',
                    'base64': pdf_base64,
                    'content_type': 'application/pdf'
                }
                
                pdf_buffer.close()
            
            # Step 6: Generate Excel in memory
            if self.format_type in ['excel', 'both']:
                excel_buffer = BytesIO()
                excel_gen = ExcelReportGenerator(data, insights, charts, self.branding, self.filters)
                
                excel_gen._add_summary_sheet()
                excel_gen._add_geographic_sheet()
                excel_gen._add_demographic_sheet()
                excel_gen._add_trends_sheet()
                excel_gen._add_performance_sheet()
                excel_gen._add_insights_sheet()
                
                excel_gen.wb.save(excel_buffer)
                
                # Convert to base64
                excel_buffer.seek(0)
                excel_base64 = base64.b64encode(excel_buffer.read()).decode('utf-8')
                
                results['files']['excel'] = {
                    'filename': f'analytics_report_{timestamp}.xlsx',
                    'base64': excel_base64,
                    'content_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
                
                excel_buffer.close()
            
            # Close all matplotlib figures
            plt.close('all')
            
            return results
            
        except Exception as e:
            import traceback
            return {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            }