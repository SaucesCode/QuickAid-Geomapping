# Standard library
import base64
import io
import os
from datetime import date, datetime, timedelta
from io import BytesIO
from pathlib import Path

import seaborn as sns
from dateutil.relativedelta import relativedelta
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Frame, Image, KeepTogether, PageBreak, PageTemplate, Paragraph,
    SimpleDocTemplate, Spacer, Table, TableStyle
)

# Django
from django.conf import settings
from django.db.models import (
    Avg, Count, DurationField, ExpressionWrapper, F,
    IntegerField, Max, Q
)
from django.db.models.functions import (
    ExtractHour, ExtractYear, TruncDate, TruncMonth
)
from django.utils import timezone
from openpyxl.formatting.rule import ColorScaleRule


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
    """Generates professional, publication-ready charts"""
    
    def __init__(self):
        # Set professional style
        sns.set_style("whitegrid")
        plt.rcParams['font.family'] = 'sans-serif'
        plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica']
        
        # DSWD Government colors
        self.primary_color = '#0066cc'
        self.secondary_color = '#4a90e2'
        self.accent_color = '#00cc66'
        
        # Professional color palette
        self.colors = [
            '#0066cc', '#00cc66', '#ff9800', '#9c27b0', 
            '#f44336', '#00bcd4', '#4caf50', '#ff5722'
        ]
    
    def _apply_professional_style(self, ax, title, xlabel, ylabel):
        """Apply consistent professional styling"""
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20, color='#2c3e50')
        ax.set_xlabel(xlabel, fontsize=12, fontweight='600', color='#34495e')
        ax.set_ylabel(ylabel, fontsize=12, fontweight='600', color='#34495e')
        ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color('#bdc3c7')
        ax.spines['bottom'].set_color('#bdc3c7')
        ax.tick_params(colors='#7f8c8d', labelsize=10)
    
    def create_bar_chart(self, data, x_field, y_field, title, xlabel, ylabel, top_n=None):

        # Extract data
        x_values = [str(item.get(x_field, "")) for item in data]
        y_values = [int(item.get(y_field, 0) or 0) for item in data]

        # Sort and limit data if top_n is provided
        if top_n:
            combined = sorted(zip(x_values, y_values), key=lambda x: x[1], reverse=True)[:top_n]
            x_values, y_values = zip(*combined) if combined else ([], [])

        # Prevent empty or zero-only data from crashing
        if not y_values or sum(y_values) == 0:
            fig, ax = plt.subplots(figsize=(6, 3.5))
            ax.text(0.5, 0.5, "No data available", ha='center', va='center', fontsize=12, color='gray')
            ax.axis("off")
            return fig

        # Safe color scaling
        max_val = max(y_values)
        if max_val == 0:
            max_val = 1

        bar_colors = [plt.cm.Blues(0.4 + 0.5 * (val / max_val)) for val in y_values]

        # Create chart
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.barh(x_values, y_values, color=bar_colors)
        ax.set_title(title)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.tick_params(axis='y', labelsize=9)
        plt.tight_layout()
        return fig

    
    def create_pie_chart(self, data, label_field, value_field, title):
        """Enhanced pie chart"""
        fig, ax = plt.subplots(figsize=(11, 9))
        
        labels = [str(item[label_field]) for item in data]
        values = [item[value_field] for item in data]
        
        filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
        if not filtered:
            plt.close(fig)
            return None
        
        labels, values = zip(*filtered)
        colors_to_use = self.colors[:len(values)]
        
        wedges, texts, autotexts = ax.pie(
            values, labels=labels, 
            autopct=lambda pct: f'{pct:.1f}%\n({int(pct/100.*sum(values)):,})',
            colors=colors_to_use,
            startangle=90,
            explode=[0.05 if i == 0 else 0 for i in range(len(values))],
            shadow=True,
            textprops={'fontsize': 10, 'fontweight': '600'}
        )
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(9)
            autotext.set_fontweight('bold')
        
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20, color='#2c3e50')
        plt.tight_layout()
        
        return fig
    
    def create_line_chart(self, data, x_field, y_field, title, xlabel, ylabel):
        """Enhanced line chart with area fill"""
        fig, ax = plt.subplots(figsize=(14, 7))
        
        sorted_data = sorted(data, key=lambda x: x[x_field])
        x_values = [item[x_field] for item in sorted_data]
        y_values = [item[y_field] for item in sorted_data]
        
        # Main line
        ax.plot(x_values, y_values, marker='o', color=self.primary_color, 
                linewidth=3, markersize=8, markerfacecolor='white', 
                markeredgewidth=2, markeredgecolor=self.primary_color)
        
        # Area fill
        ax.fill_between(range(len(x_values)), y_values, alpha=0.2, color=self.primary_color)
        
        # Value labels
        for i, (x, y) in enumerate(zip(range(len(x_values)), y_values)):
            ax.text(x, y + max(y_values)*0.03, f'{int(y):,}', 
                   ha='center', va='bottom', fontsize=9, fontweight='bold', color='#2c3e50')
        
        # Format x-axis
        if isinstance(x_values[0], datetime):
            x_labels = [x.strftime('%b %Y') for x in x_values]
        else:
            x_labels = [str(x) for x in x_values]
        
        ax.set_xticks(range(len(x_values)))
        ax.set_xticklabels(x_labels, rotation=45, ha='right')
        
        self._apply_professional_style(ax, title, xlabel, ylabel)
        plt.tight_layout()
        
        return fig
    
    # Keep all other methods (create_stacked_bar_chart, create_heatmap, generate_all_charts)
    # exactly as they are in your original file!
    
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
    """
    Official DSWD Government Report Generator
    Compliant with Philippine Government Standards
    """
    
    def __init__(self, data, insights, charts, branding, filters):
        self.data = data
        self.insights = insights
        self.charts = charts
        self.branding = branding
        self.filters = filters
        
        # Document metadata
        self.doc_ref_number = branding.get('doc_ref_number', f"DSWD-AICS-{datetime.now().strftime('%Y-%m-%d-%H%M')}")
        self.office_name = branding.get('office_name', 'DPWH AICS')
        self.prepared_by = branding.get('prepared_by', 'Data Analytics Unit')
        self.reviewed_by = branding.get('reviewed_by', 'Division Chief')
        self.approved_by = branding.get('approved_by', 'Regional Director')
        self.effectivity_date = branding.get('effectivity_date', datetime.now().strftime('%B %d, %Y'))
        
        # Official colors
        self.primary_color = '#0066cc'
        self.secondary_color = '#003366'
        
        self.styles = getSampleStyleSheet()
        self._setup_government_styles()
        self.page_count = 0
    
    def _setup_government_styles(self):
        """Setup official government document styles"""
        
        # Government Title
        self.styles.add(ParagraphStyle(
            name='GovTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor(self.secondary_color),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=22
        ))
        
        # Official Header
        self.styles.add(ParagraphStyle(
            name='OfficialHeader',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor(self.secondary_color),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceBefore=2,
            spaceAfter=2
        ))
        
        # Section Header (Numbered)
        self.styles.add(ParagraphStyle(
            name='GovSectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor(self.primary_color),
            spaceAfter=12,
            spaceBefore=16,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=colors.HexColor(self.primary_color),
            borderPadding=8,
            backColor=colors.HexColor('#e3f2fd'),
            leading=18
        ))
        
        # Subsection
        self.styles.add(ParagraphStyle(
            name='GovSubSection',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor(self.secondary_color),
            spaceAfter=8,
            spaceBefore=10,
            fontName='Helvetica-Bold',
            leading=16
        ))
        
        # Body Text (A4, Double-spaced)
        self.styles.add(ParagraphStyle(
            name='GovBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            leading=22,  # Double spacing (2 x font size)
            fontName='Helvetica',
            firstLineIndent=0.5*inch
        ))
        
        # Bullet Points
        self.styles.add(ParagraphStyle(
            name='GovBulletPoint',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=10,
            leftIndent=0.5*inch,
            bulletIndent=0.25*inch,
            leading=20,
            fontName='Helvetica'
        ))
        
        # Legal Text
        self.styles.add(ParagraphStyle(
            name='GovLegalText',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#666666'),
            alignment=TA_JUSTIFY,
            leading=12,
            fontName='Helvetica'
        ))
        
        # Signature Block
        self.styles.add(ParagraphStyle(
            name='GovSignatureBlock',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=4,
            alignment=TA_LEFT,
            fontName='Helvetica'
        ))
    
    def _official_header_footer(self, canvas, doc):
        """Official government header and footer on every page"""
        canvas.saveState()
        width, height = A4
        
        # ==================== HEADER ====================
        # Header background
        canvas.setFillColor(colors.HexColor(self.primary_color))
        canvas.rect(0, height - 0.9*inch, width, 0.9*inch, fill=True, stroke=False)
        
        # Logo placeholder (left side) - if logo is provided
        logo_path = self.branding.get('logo_path')
        if logo_path:
            try:
                canvas.drawImage(logo_path, 0.5*inch, height - 0.85*inch, 
                               width=0.6*inch, height=0.6*inch, mask='auto')
            except:
                pass
        
        # Header text (center)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawCentredString(width/2, height - 0.35*inch, 
                                "Republic of the Philippines")
        canvas.setFont('Helvetica-Bold', 12)
        canvas.drawCentredString(width/2, height - 0.52*inch,
                                "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT")
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(width/2, height - 0.68*inch,
                                self.office_name)
        
        # Classification (right side)
        canvas.setFont('Helvetica-Bold', 8)
        canvas.drawRightString(width - 0.5*inch, height - 0.35*inch,
                              "OFFICIAL USE ONLY")
        
        # Document reference (right side)
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(width - 0.5*inch, height - 0.5*inch,
                              f"Doc Ref: {self.doc_ref_number}")
        
        # ==================== FOOTER ====================
        # Footer background
        canvas.setFillColor(colors.HexColor('#f5f5f5'))
        canvas.rect(0, 0, width, 0.7*inch, fill=True, stroke=False)
        
        # Footer divider line
        canvas.setStrokeColor(colors.HexColor(self.primary_color))
        canvas.setLineWidth(2)
        canvas.line(0.5*inch, 0.65*inch, width - 0.5*inch, 0.65*inch)
        
        # Generation info (left)
        canvas.setFillColor(colors.HexColor('#666666'))
        canvas.setFont('Helvetica', 8)
        canvas.drawString(0.5*inch, 0.45*inch,
                         f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        canvas.drawString(0.5*inch, 0.3*inch,
                         f"Valid until: {self.effectivity_date}")
        
        # Page number (center)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawCentredString(width/2, 0.35*inch,
                                f"Page {doc.page}")
        
        # Contact info (right)
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(width - 0.5*inch, 0.45*inch,
                              "DSWD Analytics System")
        canvas.drawRightString(width - 0.5*inch, 0.3*inch,
                              "analytics@dswd.gov.ph")
        
        canvas.restoreState()
    
    def _create_official_table(self, data, col_widths=None, has_header=True, zebra=True):
        """Create official government-style table"""
        table = Table(data, colWidths=col_widths)
        
        style_list = [
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0 if has_header else -1), colors.HexColor(self.primary_color)),
            ('TEXTCOLOR', (0, 0), (-1, 0 if has_header else -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0 if has_header else -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0 if has_header else -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor(self.primary_color)),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]
        
        # Zebra striping
        if zebra and len(data) > 1:
            style_list.append(
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), 
                 [colors.white, colors.HexColor('#f8f9fa')])
            )
        
        table.setStyle(TableStyle(style_list))
        return table
    
    def _create_official_cover_page(self):
        """Official government cover page with all required elements"""
        elements = []
        
        # Top margin
        elements.append(Spacer(1, 1*inch))
        
        # Logo placeholder
        elements.append(Paragraph(
            "<para alignment='center'>[DSWD OFFICIAL SEAL]</para>",
            ParagraphStyle('Seal', parent=self.styles['Normal'], 
                          fontSize=10, textColor=colors.HexColor('#999999'))
        ))
        elements.append(Spacer(1, 0.3*inch))
        
        # Official header
        elements.append(Paragraph(
            "Republic of the Philippines",
            self.styles['OfficialHeader']
        ))
        elements.append(Paragraph(
            "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT",
            self.styles['GovTitle']
        ))
        elements.append(Paragraph(
            self.office_name,
            self.styles['OfficialHeader']
        ))
        elements.append(Spacer(1, 0.5*inch))
        
        # Document title
        elements.append(Paragraph(
            "<para alignment='center'><b>COMPREHENSIVE ANALYTICS REPORT</b></para>",
            ParagraphStyle('Title', parent=self.styles['Heading1'], 
                          fontSize=16, textColor=colors.HexColor(self.primary_color),
                          alignment=TA_CENTER, spaceAfter=10)
        ))
        
        elements.append(Paragraph(
            f"<para alignment='center'>Report Type: Applicant Assistance Analytics</para>",
            self.styles['OfficialHeader']
        ))
        elements.append(Spacer(1, 0.4*inch))
        
        # Document metadata table
        metadata = [
            [Paragraph("<b>Document Information</b>", self.styles['Normal']), ""],
            [Paragraph("Document Reference:", self.styles['Normal']), 
             Paragraph(self.doc_ref_number, self.styles['Normal'])],
            [Paragraph("Report Period:", self.styles['Normal']),
             Paragraph(f"{self.filters.get('start_date', 'All Records')} to {self.filters.get('end_date', 'Present')}", 
                      self.styles['Normal'])],
            [Paragraph("Date Generated:", self.styles['Normal']),
             Paragraph(datetime.now().strftime('%B %d, %Y'), self.styles['Normal'])],
            [Paragraph("Effectivity Date:", self.styles['Normal']),
             Paragraph(self.effectivity_date, self.styles['Normal'])],
            [Paragraph("Classification:", self.styles['Normal']),
             Paragraph("<b>OFFICIAL USE ONLY</b>", self.styles['Normal'])],
            [Paragraph("Total Applicants Covered:", self.styles['Normal']),
             Paragraph(f"<b>{self.data['summary']['total_applicants']:,}</b>", self.styles['Normal'])],
        ]
        
        table = self._create_official_table(metadata, col_widths=[3*inch, 3.5*inch], has_header=False, zebra=False)
        elements.append(table)
        
        elements.append(Spacer(1, 0.5*inch))
        
        # Signature blocks
        sig_table = [
            [Paragraph("<b>Prepared by:</b>", self.styles['GovSignatureBlock']),
             Paragraph("<b>Reviewed by:</b>", self.styles['GovSignatureBlock']),
             Paragraph("<b>Approved by:</b>", self.styles['GovSignatureBlock'])],
            ["", "", ""],
            ["_____________________", "_____________________", "_____________________"],
            [Paragraph(self.prepared_by, self.styles['GovSignatureBlock']),
             Paragraph(self.reviewed_by, self.styles['GovSignatureBlock']),
             Paragraph(self.approved_by, self.styles['GovSignatureBlock'])],
            [Paragraph("Data Analyst", self.styles['GovLegalText']),
             Paragraph("Division Chief", self.styles['GovLegalText']),
             Paragraph("Regional Director", self.styles['GovLegalText'])],
        ]
        
        sig_style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ])
        
        sig_table_obj = Table(sig_table, colWidths=[2*inch, 2*inch, 2*inch])
        sig_table_obj.setStyle(sig_style)
        elements.append(sig_table_obj)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Distribution list
        elements.append(Paragraph(
            "<b>Distribution:</b> Regional Office, Provincial Office, Field Offices",
            self.styles['GovLegalText']
        ))
        
        elements.append(PageBreak())
        return elements
    
    def _create_document_control_page(self):
        """Document control and revision history"""
        elements = []
        
        elements.append(Paragraph("DOCUMENT CONTROL", self.styles['GovSectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Revision history
        elements.append(Paragraph("1.1 Revision History", self.styles['GovSubSection']))
        
        revision_data = [
            [Paragraph("<b>Version</b>", self.styles['Normal']),
             Paragraph("<b>Date</b>", self.styles['Normal']),
             Paragraph("<b>Changes</b>", self.styles['Normal']),
             Paragraph("<b>Author</b>", self.styles['Normal'])],
            [Paragraph("1.0", self.styles['Normal']),
             Paragraph(datetime.now().strftime('%Y-%m-%d'), self.styles['Normal']),
             Paragraph("Initial Release", self.styles['Normal']),
             Paragraph(self.prepared_by, self.styles['Normal'])],
        ]
        
        table = self._create_official_table(revision_data, 
                                           col_widths=[1*inch, 1.5*inch, 2.5*inch, 1.5*inch])
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Abbreviations
        elements.append(Paragraph("1.2 Abbreviations and Definitions", self.styles['GovSubSection']))
        
        abbrev_data = [
            [Paragraph("<b>Term</b>", self.styles['Normal']),
             Paragraph("<b>Definition</b>", self.styles['Normal'])],
            [Paragraph("DSWD", self.styles['Normal']),
             Paragraph("Department of Social Welfare and Development", self.styles['Normal'])],
            [Paragraph("AICS", self.styles['Normal']),
             Paragraph("Assistance to Individuals in Crisis Situation", self.styles['Normal'])],
            [Paragraph("DPWH", self.styles['Normal']),
             Paragraph("Department of Public Works and Highways", self.styles['Normal'])],
            [Paragraph("KPI", self.styles['Normal']),
             Paragraph("Key Performance Indicator", self.styles['Normal'])],
        ]
        
        table = self._create_official_table(abbrev_data, col_widths=[2*inch, 4.5*inch])
        elements.append(table)
        
        elements.append(PageBreak())
        return elements
    
    def _create_table_of_contents(self):
        """Table of contents"""
        elements = []
        
        elements.append(Paragraph("TABLE OF CONTENTS", self.styles['GovSectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        toc_data = [
            [Paragraph("<b>Section</b>", self.styles['Normal']),
             Paragraph("<b>Page</b>", self.styles['Normal'])],
            [Paragraph("1.0 Executive Summary", self.styles['Normal']), "4"],
            [Paragraph("2.0 Geographic Analysis", self.styles['Normal']), "5"],
            [Paragraph("3.0 Demographic Analysis", self.styles['Normal']), "7"],
            [Paragraph("4.0 Economic Analysis", self.styles['Normal']), "9"],
            [Paragraph("5.0 Trends Analysis", self.styles['Normal']), "10"],
            [Paragraph("6.0 Performance Metrics", self.styles['Normal']), "12"],
            [Paragraph("7.0 Findings and Recommendations", self.styles['Normal']), "14"],
        ]
        
        table = self._create_official_table(toc_data, col_widths=[5*inch, 1.5*inch])
        elements.append(table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # List of tables
        elements.append(Paragraph("LIST OF TABLES", self.styles['GovSubSection']))
        
        lot_data = [
            [Paragraph("<b>Table</b>", self.styles['Normal']),
             Paragraph("<b>Title</b>", self.styles['Normal']),
             Paragraph("<b>Page</b>", self.styles['Normal'])],
            [Paragraph("1", self.styles['Normal']),
             Paragraph("Key Performance Indicators", self.styles['Normal']), "4"],
            [Paragraph("2", self.styles['Normal']),
             Paragraph("Top Barangays by Application Volume", self.styles['Normal']), "6"],
            [Paragraph("3", self.styles['Normal']),
             Paragraph("Demographic Distribution Summary", self.styles['Normal']), "8"],
        ]
        
        table = self._create_official_table(lot_data, col_widths=[1*inch, 4*inch, 1.5*inch])
        elements.append(table)
        
        elements.append(PageBreak())
        return elements
    
    def _create_executive_summary_page(self):
        """Separate executive summary page"""
        elements = []
        
        elements.append(Paragraph("EXECUTIVE SUMMARY", self.styles['GovSectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Summary narrative
        elements.append(Paragraph(self.insights['executive_summary'], self.styles['GovBodyText']))
        elements.append(Spacer(1, 0.3*inch))
        
        # KPI Table
        elements.append(Paragraph("Table 1: Key Performance Indicators", self.styles['GovSubSection']))
        
        summary = self.data['summary']
        kpi_data = [
            [Paragraph("<b>Indicator</b>", self.styles['Normal']),
             Paragraph("<b>Value</b>", self.styles['Normal']),
             Paragraph("<b>Comparison</b>", self.styles['Normal'])],
            [Paragraph("Total Applicants Processed", self.styles['Normal']),
             Paragraph(f"{summary['total_applicants']:,}", self.styles['Normal']),
             Paragraph(f"Growth: {summary['growth_rate']:+.1f}%", self.styles['Normal'])],
            [Paragraph("Average Processing Time", self.styles['Normal']),
             Paragraph(f"{summary['avg_processing_minutes']:.1f} minutes", self.styles['Normal']),
             Paragraph("Target: <10 min", self.styles['Normal'])],
            [Paragraph("Most Common Assistance Type", self.styles['Normal']),
             Paragraph(summary['most_common_type'], self.styles['Normal']),
             Paragraph("Primary Service", self.styles['Normal'])],
            [Paragraph("Top Service Location", self.styles['Normal']),
             Paragraph(summary['top_barangay'], self.styles['Normal']),
             Paragraph("Highest Volume", self.styles['Normal'])],
        ]
        
        table = self._create_official_table(kpi_data, col_widths=[2.5*inch, 2*inch, 2*inch])
        elements.append(table)
        
        elements.append(PageBreak())
        return elements
    
    def _create_section(self, section_number, title, insights_list, data_key):
        """Generic numbered section creator"""
        elements = []
        
        elements.append(Paragraph(f"{section_number} {title.upper()}", self.styles['GovSectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Insights as bullet points
        for insight in insights_list:
            elements.append(Paragraph(f"• {insight}", self.styles['GovBulletPoint']))
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Add relevant data tables based on section
        # This is customizable per section
        
        elements.append(PageBreak())
        return elements
    
    def _create_legal_compliance_page(self):
        """Legal and compliance notices"""
        elements = []
        
        elements.append(Paragraph("LEGAL AND COMPLIANCE NOTICES", self.styles['GovSectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Data Privacy Act
        elements.append(Paragraph("Data Privacy Act of 2012 Compliance", self.styles['GovSubSection']))
        elements.append(Paragraph(
            "This report has been prepared in compliance with Republic Act No. 10173, also known as the "
            "Data Privacy Act of 2012. All personal data included in this report has been processed "
            "lawfully, fairly, and in a transparent manner. Individual identities have been anonymized "
            "and aggregated to protect privacy rights.",
            self.styles['GovLegalText']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Disclaimer
        elements.append(Paragraph("Disclaimer", self.styles['GovSubSection']))
        elements.append(Paragraph(
            "The information contained in this report is based on data available as of the generation date. "
            "While every effort has been made to ensure accuracy, DSWD does not guarantee the completeness "
            "or accuracy of the information and accepts no liability for any errors or omissions. "
            "This report is intended for official use only and should not be distributed without authorization.",
            self.styles['GovLegalText']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Confidentiality
        elements.append(Paragraph("Confidentiality Notice", self.styles['GovSubSection']))
        elements.append(Paragraph(
            "This document contains confidential information intended solely for the use of authorized "
            "DSWD personnel. Unauthorized disclosure, copying, distribution, or use of the contents "
            "of this report is strictly prohibited and may be unlawful. If you have received this "
            "report in error, please notify the sender immediately and destroy all copies.",
            self.styles['GovLegalText']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Copyright
        elements.append(Paragraph("Copyright and Ownership", self.styles['GovSubSection']))
        elements.append(Paragraph(
            f"© {datetime.now().year} Department of Social Welfare and Development. All rights reserved. "
            "This report and its contents are the property of DSWD and may not be reproduced, "
            "distributed, or transmitted in any form without prior written permission.",
            self.styles['GovLegalText']
        ))
        
        return elements
    
    def generate(self, output_path):
        """Generate official DSWD government report"""
        # A4 size with government-standard margins
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=1*inch,
            leftMargin=1*inch,
            topMargin=1.2*inch,  # Space for header
            bottomMargin=1*inch  # Space for footer
        )
        
        story = []
        
        # Build document structure
        story.extend(self._create_official_cover_page())
        story.extend(self._create_document_control_page())
        story.extend(self._create_table_of_contents())
        story.extend(self._create_executive_summary_page())
        
        # Main content sections (numbered)
        story.extend(self._create_section("2.0", "Geographic Analysis", 
                                         self.insights['geographic'], 'geographic'))
        story.extend(self._create_section("3.0", "Demographic Analysis",
                                         self.insights['demographic'], 'demographics'))
        story.extend(self._create_section("4.0", "Economic Analysis",
                                         ["Income distribution analysis"], 'economics'))
        story.extend(self._create_section("5.0", "Trends Analysis",
                                         self.insights['trends'], 'trends'))
        story.extend(self._create_section("6.0", "Performance Metrics",
                                         self.insights['performance'], 'performance'))
        story.extend(self._create_section("7.0", "Findings and Recommendations",
                                         self.insights['recommendations'], None))
        
        # Legal compliance page
        story.extend(self._create_legal_compliance_page())
        
        # Build PDF with official headers and footers
        doc.build(story, 
                 onFirstPage=self._official_header_footer, 
                 onLaterPages=self._official_header_footer)


class ExcelReportGenerator:
    """Enhanced Excel with charts, conditional formatting, dashboard"""
    
    def __init__(self, data, insights, charts, branding, filters):
        self.data = data
        self.insights = insights
        self.charts = charts  # Not used for Excel, but keep for consistency
        self.branding = branding
        self.filters = filters
        self.wb = Workbook()
        
        # Professional colors
        self.primary_color = self.branding.get('primary_color', '0066cc').replace('#', '')
        self.light_blue = 'e3f2fd'
        
        # Styles
        self.title_font = Font(name='Calibri', size=18, bold=True, color=self.primary_color)
        self.header_font = Font(name='Calibri', size=12, bold=True, color='FFFFFF')
        self.subheader_font = Font(name='Calibri', size=11, bold=True, color=self.primary_color)
        
        self.header_fill = PatternFill(start_color=self.primary_color, end_color=self.primary_color, fill_type='solid')
        self.light_fill = PatternFill(start_color=self.light_blue, end_color=self.light_blue, fill_type='solid')
        
        self.thin_border = Border(
            left=Side(style='thin', color='BDBDBD'),
            right=Side(style='thin', color='BDBDBD'),
            top=Side(style='thin', color='BDBDBD'),
            bottom=Side(style='thin', color='BDBDBD')
        )
    
    def _create_dashboard_sheet(self):
        """NEW: Executive dashboard with KPIs"""
        ws = self.wb.active
        ws.title = "📊 Dashboard"
        
        # Title
        ws.merge_cells('A1:H1')
        ws['A1'] = self.branding.get('organization_name', 'DSWD Quezon Province')
        ws['A1'].font = self.title_font
        ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
        
        # KPI Cards
        row = 7
        summary = self.data['summary']
        
        # KPI 1: Total Applicants
        ws.merge_cells(f'A{row}:B{row}')
        ws[f'A{row}'] = "Total Applicants"
        ws[f'A{row}'].font = self.subheader_font
        ws[f'A{row}'].fill = self.light_fill
        ws[f'A{row}'].alignment = Alignment(horizontal='center')
        
        ws.merge_cells(f'A{row+1}:B{row+1}')
        ws[f'A{row+1}'] = summary['total_applicants']
        ws[f'A{row+1}'].font = Font(size=32, bold=True, color=self.primary_color)
        ws[f'A{row+1}'].alignment = Alignment(horizontal='center')
        ws.row_dimensions[row+1].height = 50
        
        # KPI 2: Processing Time
        ws.merge_cells(f'D{row}:E{row}')
        ws[f'D{row}'] = "Avg Processing Time"
        ws[f'D{row}'].font = self.subheader_font
        ws[f'D{row}'].fill = self.light_fill
        ws[f'D{row}'].alignment = Alignment(horizontal='center')
        
        ws.merge_cells(f'D{row+1}:E{row+1}')
        ws[f'D{row+1}'] = f"{summary['avg_processing_minutes']:.1f} min"
        ws[f'D{row+1}'].font = Font(size=28, bold=True, color='00cc66')
        ws[f'D{row+1}'].alignment = Alignment(horizontal='center')
        
        # KPI 3: Growth
        ws.merge_cells(f'G{row}:H{row}')
        ws[f'G{row}'] = "Monthly Growth"
        ws[f'G{row}'].font = self.subheader_font
        ws[f'G{row}'].fill = self.light_fill
        ws[f'G{row}'].alignment = Alignment(horizontal='center')
        
        ws.merge_cells(f'G{row+1}:H{row+1}')
        growth_symbol = "↑" if summary['growth_rate'] > 0 else "↓"
        ws[f'G{row+1}'] = f"{growth_symbol} {abs(summary['growth_rate']):.1f}%"
        growth_color = '00cc66' if summary['growth_rate'] > 0 else 'f44336'
        ws[f'G{row+1}'].font = Font(size=28, bold=True, color=growth_color)
        ws[f'G{row+1}'].alignment = Alignment(horizontal='center')
    
    def _add_data_sheet_with_chart(self, sheet_name, data, headers, chart_type='bar'):
        """NEW: Add sheet with embedded chart"""
        ws = self.wb.create_sheet(sheet_name)
        
        # Add title
        ws.merge_cells('A1:D1')
        ws['A1'] = sheet_name
        ws['A1'].font = self.title_font
        ws['A1'].alignment = Alignment(horizontal='center')
        
        # Add headers
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=3, column=col, value=header)
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.alignment = Alignment(horizontal='center')
            cell.border = self.thin_border
        
        # Add data
        for row_idx, row_data in enumerate(data, start=4):
            for col_idx, value in enumerate(row_data, start=1):
                cell = ws.cell(row=row_idx, column=col_idx, value=value)
                cell.border = self.thin_border
                if row_idx % 2 == 0:
                    cell.fill = self.light_fill
        
        # Freeze panes
        ws.freeze_panes = 'A4'
        
        # Add filter
        ws.auto_filter.ref = f'A3:{get_column_letter(len(headers))}{len(data) + 3}'
        
        # Add embedded chart
        if len(data) > 0:
            if chart_type == 'bar':
                chart = BarChart()
                chart.title = sheet_name
                data_ref = Reference(ws, min_col=2, min_row=3, max_row=min(len(data) + 3, 20))
                cats_ref = Reference(ws, min_col=1, min_row=4, max_row=min(len(data) + 3, 20))
                chart.add_data(data_ref, titles_from_data=True)
                chart.set_categories(cats_ref)
                ws.add_chart(chart, f'{get_column_letter(len(headers) + 2)}3')
        
        # Conditional formatting for numeric columns
        if len(data) > 0 and isinstance(data[0][1], (int, float)):
            ws.conditional_formatting.add(
                f'B4:B{len(data) + 3}',
                ColorScaleRule(
                    start_type='min', start_color='FFFFFF',
                    mid_type='percentile', mid_value=50, mid_color=self.light_blue,
                    end_type='max', end_color=self.primary_color
                )
            )
        
        # Auto-adjust columns
        for column in ws.columns:
            max_length = 0
            column_letter = get_column_letter(column[0].column)
            for cell in column:
                try:
                    max_length = max(max_length, len(str(cell.value)))
                except:
                    pass
            ws.column_dimensions[column_letter].width = min(max_length + 3, 60)

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
            cell.border = self.thin_border
        
        # Style data rows
        for r in range(row + 1, row + len(metrics)):
            for cell in ws[r]:
                cell.border = self.thin_border
        
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
            cell.border = self.thin_border
            cell.alignment = Alignment(horizontal='center')
        
        # Add data
        for row_data in data:
            ws.append(row_data)
        
        # Apply borders to all data
        for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
            for cell in row:
                cell.border = self.thin_border
        
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
        """Generate enhanced Excel report with unified chart-based sheets"""
        # 1️⃣ Create Dashboard Sheet
        self._create_dashboard_sheet()

        # 2️⃣ Geographic Sheets
        geo = self.data['geographic']
        if geo['top_barangays']:
            barangay_data = [[item['background_info__barangay__name'], item['count']]
                            for item in geo['top_barangays']]
            self._add_data_sheet_with_chart(
                '📍 Top Barangays', barangay_data, ['Barangay', 'Applications'], 'bar'
            )

        if geo['by_city']:
            city_data = [[item['background_info__barangay__city__name'], item['count']]
                        for item in geo['by_city']]
            self._add_data_sheet_with_chart(
                '🏙️ Applications by City', city_data, ['City', 'Applications'], 'bar'
            )

        # 3️⃣ Demographic Sheets
        demo = self.data['demographics']

        if demo['by_gender']:
            gender_data = [[item['background_info__sex'], item['count']]
                        for item in demo['by_gender']]
            self._add_data_sheet_with_chart(
                '👥 Gender Distribution', gender_data, ['Gender', 'Applicants'], 'bar'
            )

        if demo['by_civil_status']:
            civil_data = [[item['background_info__civil_status'], item['count']]
                        for item in demo['by_civil_status']]
            self._add_data_sheet_with_chart(
                '💍 Civil Status', civil_data, ['Civil Status', 'Applicants'], 'bar'
            )

        if demo['age_groups']:
            age_data = [[group, count] for group, count in demo['age_groups'].items()]
            self._add_data_sheet_with_chart(
                '📊 Age Groups', age_data, ['Age Group', 'Applicants'], 'bar'
            )

        if demo['by_occupation']:
            occupation_data = [[item['background_info__occupation'], item['count']]
                            for item in demo['by_occupation']]
            self._add_data_sheet_with_chart(
                '💼 Occupations', occupation_data, ['Occupation', 'Applicants'], 'bar'
            )

        # 4️⃣ Economic Sheet
        econ = self.data['economics']
        if econ['income_distribution']:
            income_data = [[item['range'], item['count']]
                        for item in econ['income_distribution']]
            self._add_data_sheet_with_chart(
                '💰 Income Distribution', income_data, ['Income Range', 'Applicants'], 'bar'
            )

        # 5️⃣ Trends Sheet
        trends = self.data['trends']
        if trends['monthly']:
            monthly_data = [[item['month'].strftime("%B %Y") if item['month'] else "N/A", item['count']]
                            for item in trends['monthly']]
            self._add_data_sheet_with_chart(
                '📈 Monthly Trends', monthly_data, ['Month', 'Applications'], 'bar'
            )

        if trends['yearly']:
            yearly_data = [[item['year'], item['count']]
                        for item in trends['yearly']]
            self._add_data_sheet_with_chart(
                '📆 Yearly Trends', yearly_data, ['Year', 'Applications'], 'bar'
            )

        if trends['by_assistance']:
            assistance_data = [[item['type_of_assistance'], item['count']]
                            for item in trends['by_assistance']]
            self._add_data_sheet_with_chart(
                '🩺 Assistance Types', assistance_data, ['Assistance Type', 'Applications'], 'bar'
            )

        # 6️⃣ Performance Sheet
        perf = self.data['performance']
        if perf['staff_productivity']:
            staff_data = [[item['staff__username'], item['count']]
                        for item in perf['staff_productivity']]
            self._add_data_sheet_with_chart(
                '🧑‍💼 Staff Productivity', staff_data, ['Staff', 'Applications'], 'bar'
            )

        if perf['processing_by_type']:
            proc_data = [[item['type_of_assistance'], item.get('avg_minutes', 0)]
                        for item in perf['processing_by_type']]
            self._add_data_sheet_with_chart(
                '⚙️ Avg Processing Time', proc_data, ['Assistance Type', 'Minutes'], 'bar'
            )

        if perf['activity_heatmap']:
            heat_data = [[f"{item['hour']}:00", item['count']]
                        for item in perf['activity_heatmap']]
            self._add_data_sheet_with_chart(
                '⏰ Activity Heatmap', heat_data, ['Hour', 'Applications'], 'bar'
            )

        # 7️⃣ Insights Sheet (recommendations, summary)
        insights = self.insights
        insights_data = [
            ["Executive Summary", insights.get('executive_summary', '')],
            ["Top Insights (Geographic)", "\n".join(insights.get('geographic', []))],
            ["Demographic Insights", "\n".join(insights.get('demographic', []))],
            ["Trend Insights", "\n".join(insights.get('trends', []))],
            ["Performance Insights", "\n".join(insights.get('performance', []))],
            ["Recommendations", "\n".join(insights.get('recommendations', []))],
        ]
        self._add_data_sheet_with_chart(
            '🧭 Insights & Recommendations', insights_data, ['Category', 'Details'], 'bar'
        )

        # ✅ Save workbook
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

                doc = SimpleDocTemplate(
                    pdf_buffer,
                    pagesize=letter,
                    rightMargin=0.75*inch,
                    leftMargin=0.75*inch,
                    topMargin=0.75*inch,
                    bottomMargin=0.75*inch
                )

                story = []
                story.extend(pdf_gen._create_official_cover_page())
                story.extend(pdf_gen._create_document_control_page())
                story.extend(pdf_gen._create_table_of_contents())
                story.extend(pdf_gen._create_executive_summary_page())

                # Main numbered sections (match the generate() method)
                story.extend(pdf_gen._create_section("2.0", "Geographic Analysis", insights['geographic'], 'geographic'))
                story.extend(pdf_gen._create_section("3.0", "Demographic Analysis", insights['demographic'], 'demographics'))

                if 'income' in charts:
                    story.extend(pdf_gen._create_section("4.0", "Economic Analysis",
                                                        ["Income distribution across applicant base"], 'economics'))
                    story.append(PageBreak())

                story.extend(pdf_gen._create_section("5.0", "Trends Analysis", insights['trends'], 'trends'))
                story.extend(pdf_gen._create_section("6.0", "Performance Metrics", insights['performance'], 'performance'))
                story.extend(pdf_gen._create_section("7.0", "Findings and Recommendations",
                                                    insights['recommendations'], None))

                story.extend(pdf_gen._create_legal_compliance_page())

                doc.build(story, onFirstPage=pdf_gen._official_header_footer, onLaterPages=pdf_gen._official_header_footer)
                
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