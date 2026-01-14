from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import (
    Applicant, Approval, ApprovalBatch, DisbursementBatch, 
    DisbursementClaim, CustomUser
)
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed budget/disbursement data for testing'

    def handle(self, *args, **kwargs):
        # Get a staff user
        staff = CustomUser.objects.filter(is_staff=True).first()
        if not staff:
            self.stdout.write(self.style.ERROR('No staff user found'))
            return

        # Get existing applicants with approvals
        approved_applicants = Applicant.objects.filter(
            approvals__isnull=False
        ).distinct()[:50]

        if not approved_applicants:
            self.stdout.write(self.style.ERROR('No approved applicants found'))
            return

        # Create disbursement batches
        batch1 = DisbursementBatch.objects.create(
            name="January 2026 Disbursement",
            assistance_type="Medical",
            payout_date=timezone.now().date(),
            status="OPEN",
            created_by=staff
        )

        batch2 = DisbursementBatch.objects.create(
            name="December 2025 Disbursement",
            assistance_type="Educational",
            payout_date=timezone.now().date() - timedelta(days=30),
            status="CLOSED",
            created_by=staff
        )

        # Create claims for batch 1 (current month)
        for i, applicant in enumerate(approved_applicants[:30]):
            approval = applicant.approvals.first()
            status = "CLAIMED" if i < 20 else "PENDING"  # 20 claimed, 10 pending
            
            DisbursementClaim.objects.create(
                batch=batch1,
                approval=approval,
                applicant=applicant,
                amount=Decimal('4000.00'),
                status=status,
                payout_date=batch1.payout_date if status == "CLAIMED" else None
            )

        # Create claims for batch 2 (last month)
        for i, applicant in enumerate(approved_applicants[30:50]):
            approval = applicant.approvals.first()
            status = "CLAIMED" if i < 15 else "UNCLAIMED"  # 15 claimed, 5 unclaimed
            
            DisbursementClaim.objects.create(
                batch=batch2,
                approval=approval,
                applicant=applicant,
                amount=Decimal('4000.00'),
                status=status,
                payout_date=batch2.payout_date if status == "CLAIMED" else None
            )

        # Update batch totals
        batch1.update_totals()
        batch2.update_totals()

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {DisbursementClaim.objects.count()} disbursement claims'
        ))