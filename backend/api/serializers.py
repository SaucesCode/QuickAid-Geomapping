from rest_framework import serializers
from django.db import models
from .models import (
    Applicant, Representative, BackgroundInfo, 
    Barangay, Approval, DisbursementClaim, 
    DisbursementBatch, ApplicantHistory, ApprovalAuditLog
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import datetime, timedelta
from django.utils import timezone
from .utils import log_staff_activity

# ---------------------------------------------------------
# JWT TOKEN SERIALIZER
# ---------------------------------------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        token['last_active'] = user.last_active.isoformat() if user.last_active else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])

        log_staff_activity(
            user,
            "LOGIN STAFF",
            f"{user.username} logged in successfully",
            request=self.context.get('request')
        )

        data['staff_info'] = {
            'id': user.id,
            'ref_code': user.ref_code,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'is_superuser': user.is_superuser,
            'last_active': user.last_active.isoformat() if user.last_active else None
        }
        return data


# ---------------------------------------------------------
# BARANGAY SERIALIZER
# ---------------------------------------------------------
class BarangayDetailSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    province_name = serializers.CharField(source='city.province.name', read_only=True)
    region_name = serializers.CharField(source='city.province.region.name', read_only=True)

    class Meta:
        model = Barangay
        fields = ['id', 'name', 'psgc_code', 'city_name', 'province_name', 'region_name']


# ---------------------------------------------------------
# BACKGROUND INFO SERIALIZER
# ---------------------------------------------------------
class BackgroundInfoSerializer(serializers.ModelSerializer):
    barangay = serializers.CharField()
    barangay_details = BarangayDetailSerializer(source='barangay', read_only=True)

    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address", "barangay", "barangay_details",
            "sex", "civil_status", "occupation", "monthly_income"
        ]
        # you previously disabled validators here which is correct for nested create/get_or_create behavior
        validators = []

    def validate_barangay(self, value):
        barangay_obj = (
            Barangay.objects.filter(psgc_code=value).first() or
            Barangay.objects.filter(name__iexact=value).first()
        )
        if not barangay_obj:
            raise serializers.ValidationError("Invalid Barangay code or name.")
        return barangay_obj

    def create(self, validated_data):
        barangay = validated_data.pop("barangay")
        return BackgroundInfo.objects.create(barangay=barangay, **validated_data)


# ---------------------------------------------------------
# REPRESENTATIVE BACKGROUND INFO — FIXED VERSION
# ---------------------------------------------------------
class RepresentativeBackgroundInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address",
            "sex", "civil_status", "occupation", "monthly_income"
        ]
        # disable automatic unique_together validation here so nested validation does not error
        validators = []

    def create(self, validated_data):
        """
        Use a safe get_or_create (case-insensitive) for representative BackgroundInfo:
        - If a matching record (first_name, last_name, birthday) exists, reuse and update it.
        - Otherwise create a new BackgroundInfo with a default barangay (so FK is satisfied).
        """
        # normalize keys for lookup
        first = (validated_data.get("first_name") or "").strip()
        last = (validated_data.get("last_name") or "").strip()
        birthday = validated_data.get("birthday")

        # try case-insensitive lookup for existing background info
        bg_qs = BackgroundInfo.objects.filter(
            first_name__iexact=first,
            last_name__iexact=last,
            birthday=birthday
        )

        default_barangay = Barangay.objects.first()

        bg = bg_qs.first()
        if bg:
            # update existing record with incoming fields
            for k, v in validated_data.items():
                setattr(bg, k, v)
            # ensure barangay exists (we don't change it here unless provided)
            if not getattr(bg, "barangay", None) and default_barangay:
                bg.barangay = default_barangay
            bg.save()
            return bg

        # not found -> create new (set a default barangay so FK won't fail)
        return BackgroundInfo.objects.create(barangay=default_barangay, **validated_data)


# ---------------------------------------------------------
# REPRESENTATIVE SERIALIZER
# ---------------------------------------------------------
class RepresentativeSerializer(serializers.ModelSerializer):
    background_info = RepresentativeBackgroundInfoSerializer()

    class Meta:
        model = Representative
        fields = ["id", "background_info", "relationship", "contact_number"]

    def create(self, validated_data):
        bg_data = validated_data.pop("background_info")
        bg_instance = RepresentativeBackgroundInfoSerializer().create(bg_data)

        return Representative.objects.create(
            background_info=bg_instance,
            **validated_data
        )
    
class ApplicantHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantHistory
        fields = [
            "id",
            "type_of_assistance",
            "date_applied",
        ]

# ---------------------------------------------------------
# DISBURSEMENT SERIALIZERS (FIXED)
# ---------------------------------------------------------

class DisbursementClaimSerializer(serializers.ModelSerializer):
    # ✅ ADD: Applicant details for the disbursement list
    applicant_id = serializers.IntegerField(source='applicant.id', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    barangay = serializers.CharField(source='applicant.background_info.barangay.name', read_only=True)
    city = serializers.CharField(source='applicant.background_info.barangay.city.name', read_only=True)
    contact_number = serializers.CharField(source='applicant.contact_number', read_only=True)
    assistance_type = serializers.CharField(source='applicant.type_of_assistance', read_only=True)
    
    # ✅ ADD: Status display
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    
    # ✅ ADD: Approval reference
    approval_id = serializers.IntegerField(source='approval.id', read_only=True)
    approval_notes = serializers.CharField(source='approval.notes', read_only=True)

    class Meta:
        model = DisbursementClaim
        fields = [
            'id',
            'batch',
            'approval',
            'approval_id',
            'approval_notes',
            'applicant',
            'applicant_id',
            'applicant_name',
            'barangay',
            'city',
            'contact_number',
            'assistance_type',
            'amount',
            'status',
            'status_label',
            'payout_date',
            'updated_at',
        ]
        read_only_fields = ['id', 'batch', 'approval', 'applicant', 'updated_at']

    def get_applicant_name(self, obj):
        bg = obj.applicant.background_info
        middle = f"{bg.middle_initial}." if bg.middle_initial else ""
        suffix = bg.suffix or ""
        full_name = f"{bg.last_name}, {bg.first_name} {middle} {suffix}".strip()
        return full_name


class DisbursementBatchSerializer(serializers.ModelSerializer):
    # ✅ ADD: User info
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    created_by_full_name = serializers.SerializerMethodField()
    
    # ✅ ADD: Approval batch link
    approval_batch_id = serializers.IntegerField(source='approval_batch.id', read_only=True)
    approval_batch_file = serializers.CharField(source='approval_batch.file_name', read_only=True)
    
    # ✅ ADD: Computed counts
    total_claims = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()
    claimed_count = serializers.SerializerMethodField()
    unclaimed_count = serializers.SerializerMethodField()
    
    # ✅ ADD: Amount totals
    total_amount = serializers.SerializerMethodField()
    claimed_amount = serializers.SerializerMethodField()
    unclaimed_amount = serializers.SerializerMethodField()

    class Meta:
        model = DisbursementBatch
        fields = [
            'id',
            'approval_batch',
            'approval_batch_id',
            'approval_batch_file',
            'name',
            'assistance_type',
            'payout_date',
            'status',
            'created_by',
            'created_by_name',
            'created_by_full_name',
            'created_at',
            'finalized_at',
            'total_beneficiaries',
            'total_claimed',
            'total_unclaimed',
            'total_claims',
            'pending_count',
            'claimed_count',
            'unclaimed_count',
            'total_amount',
            'claimed_amount',
            'unclaimed_amount',
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'finalized_at',
            'total_beneficiaries', 'total_claimed', 'total_unclaimed'
        ]

    def get_created_by_full_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return "System"

    def get_total_claims(self, obj):
        return obj.claims.count()

    def get_pending_count(self, obj):
        return obj.claims.filter(status='PENDING').count()

    def get_claimed_count(self, obj):
        return obj.claims.filter(status='CLAIMED').count()

    def get_unclaimed_count(self, obj):
        return obj.claims.filter(status='UNCLAIMED').count()

    def get_total_amount(self, obj):
        from decimal import Decimal
        return obj.claims.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

    def get_claimed_amount(self, obj):
        from decimal import Decimal
        return obj.claims.filter(status='CLAIMED').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

    def get_unclaimed_amount(self, obj):
        from decimal import Decimal
        return obj.claims.filter(status='UNCLAIMED').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')



class ApprovalAuditLogSerializer(serializers.ModelSerializer):
    performed_by = serializers.StringRelatedField()

    class Meta:
        model = ApprovalAuditLog
        fields = ["action", "performed_by", "notes", "timestamp"]

class DisbursementBatchListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing batches without detailed claims"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    approval_batch_file = serializers.CharField(source='approval_batch.file_name', read_only=True)
    
    # Only basic counts
    total_claims = serializers.IntegerField(source='claims.count', read_only=True)
    pending_count = serializers.SerializerMethodField()
    claimed_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DisbursementBatch
        fields = [
            'id',
            'name',
            'assistance_type',
            'payout_date',
            'status',
            'created_by_name',
            'approval_batch_file',
            'created_at',
            'total_beneficiaries',
            'total_claimed',
            'total_unclaimed',
            'total_claims',
            'pending_count',
            'claimed_count',
        ]

    def get_pending_count(self, obj):
        return obj.claims.filter(status='PENDING').count()

    def get_claimed_count(self, obj):
        return obj.claims.filter(status='CLAIMED').count()


# ---------------------------------------------------------
# APPROVAL SERIALIZER
# ---------------------------------------------------------
class ApprovalSerializer(serializers.ModelSerializer):
    approved_by = serializers.StringRelatedField()
    disbursement_claim = DisbursementClaimSerializer(read_only=True)
    claim_status = serializers.SerializerMethodField()
    claim_status_label = serializers.SerializerMethodField()
    payout_date = serializers.SerializerMethodField()
    amount = serializers.SerializerMethodField()
    audit_trail = serializers.SerializerMethodField()
    class Meta:
        model = Approval
        fields = [
            "id",
            "approved_at",
            "approved_by",
            "notes",
            "disbursement_claim",
            "claim_status",
            "claim_status_label",
            "amount",
            "payout_date",
            "audit_trail",
        ]

    def get_claim_status(self, obj):
        if hasattr(obj, "disbursement_claim"):
            return obj.disbursement_claim.status
        return "NOT_SCHEDULED"
    
    def get_claim_status_label(self, obj):
        if not hasattr(obj, "disbursement_claim"):
            return "Not yet scheduled for payout"

        claim = obj.disbursement_claim

        if claim.status == "CLAIMED":
            return f"Claimed on {claim.payout_date}"
        if claim.status == "UNCLAIMED":
            return "Unclaimed"
        if claim.status == "PENDING":
            return "Pending payout"

        return "Unknown"

    def get_amount(self, obj):
        return getattr(obj.disbursement_claim, "amount", None)

    def get_payout_date(self, obj):
        return getattr(obj.disbursement_claim, "payout_date", None)
    
    
    def get_audit_trail(self, obj):
        return ApprovalAuditLogSerializer(
            obj.audit_logs.all(),
            many=True
        ).data


# ---------------------------------------------------------
# APPLICANT SERIALIZER
# ---------------------------------------------------------
class ApplicantSerializer(serializers.ModelSerializer):
    background_info = BackgroundInfoSerializer()
    representative = RepresentativeSerializer(required=False, allow_null=True)

    staff = serializers.CharField(source='staff.username', read_only=True)
    city = serializers.CharField(source='background_info.barangay.city.name', read_only=True)
    staff_ref_code = serializers.UUIDField(source='staff.ref_code', read_only=True)
    approval_count = serializers.IntegerField(source="approvals.count", read_only=True)
    approvals = ApprovalSerializer(many=True, read_only=True)
    identity_status = serializers.CharField(read_only=True)
    identity_notes = serializers.CharField(read_only=True)
    application_history = ApplicantHistorySerializer(
        source="background_info.histories",
        many=True,
        read_only=True
    )


    total_approved_amount = serializers.SerializerMethodField()
    total_claimed_amount = serializers.SerializerMethodField()
    total_unclaimed_amount = serializers.SerializerMethodField()


    def _claims(self, obj):
        return obj.disbursement_claims.all()

    def get_total_approved_amount(self, obj):
        return sum(
            c.amount for c in self._claims(obj)
            if c.status in ["PENDING", "CLAIMED", "UNCLAIMED"]
        )

    def get_total_claimed_amount(self, obj):
        return sum(
            c.amount for c in self._claims(obj)
            if c.status == "CLAIMED"
        )

    def get_total_unclaimed_amount(self, obj):
        return sum(
            c.amount for c in self._claims(obj)
            if c.status == "UNCLAIMED"
        )

    class Meta:
        model = Applicant
        fields = "__all__"
        read_only_fields = ["id", "staff", "staff_ref_code",
                            "longitude", "latitude", "date_filled"]
        
    def create(self, validated_data):
        request = self.context.get("request")
        staff_user = request.user if request and request.user.is_authenticated else None

        # Extract nested data
        bg_data = validated_data.pop("background_info")
        rep_data = validated_data.pop("representative", None)
        created_at = validated_data.pop("created_at", None)

        # Remove fields that would cause duplicate keyword arguments
        validated_data.pop("staff", None)
        validated_data.pop("staff_ref_code", None)

        # -----------------------------------------------
        # Normalize identifiers for matching
        # -----------------------------------------------
        first = (bg_data.get("first_name") or "").strip()
        last = (bg_data.get("last_name") or "").strip()
        birthday = bg_data.get("birthday")

        # Ensure birthday is a proper date
        if isinstance(birthday, str):
            try:
                birthday = datetime.strptime(birthday, "%Y-%m-%d").date()
            except:
                pass

        print("\n====== APPLICANT CREATE START ======")
        print(f"Applicant: {first} {last} | Birthday: {birthday} | Contact: {validated_data.get('contact_number')}")

        # -----------------------------------------------
        # 1. Match BackgroundInfo BEFORE modifying it
        # -----------------------------------------------
        background_info = BackgroundInfo.objects.filter(
            first_name__iexact=first,
            last_name__iexact=last,
            birthday=birthday,
        ).first()

        if background_info:
            print(f"Reusing BackgroundInfo ID: {background_info.id}")
            # Update existing BI fields
            for key, value in bg_data.items():
                setattr(background_info, key, value)
            background_info.save()
        else:
            print("Creating NEW BackgroundInfo record")
            background_info = BackgroundInfo.objects.create(**bg_data)

        # -----------------------------------------------
        # 2. Enforce 3-month rule (using BI → Applicant)
        # -----------------------------------------------
        now = timezone.now()
        cutoff = now - timedelta(days=90)

        recent_application = (
            Applicant.objects.filter(
                background_info=background_info,
                is_archived=False,
                date_filled__gte=cutoff,
            )
            .order_by("-date_filled")
            .first()
        )

        if recent_application:
            next_eligible = recent_application.date_filled + timedelta(days=90)
            print("BLOCKED: 3-month rule violated")
            raise serializers.ValidationError(
                f"This person already submitted an application on "
                f"{recent_application.date_filled.strftime('%B %d, %Y')}. "
                f"Next eligible date: {next_eligible.strftime('%B %d, %Y')}."
            )
        
        # -----------------------------------------------
        # 2.5 Identity status evaluation (NON-BLOCKING)
        # -----------------------------------------------


        SEVERITY_ORDER = {
            "NEW": 1,
            "REVIEWED": 2,
            "SUSPICIOUS": 3,
            "BLOCKED": 4,
        }

        identity_status = "NEW"
        identity_notes = ""

        contact_number = validated_data.get("contact_number")

        # Count history for same person (any time)
        history_count = Applicant.objects.filter(
            background_info__first_name__iexact=background_info.first_name,
            background_info__last_name__iexact=background_info.last_name,
            background_info__birthday=background_info.birthday,
        ).exclude(is_archived=True).count()

        # Same contact, different birthday
        conflict_contact_birthday = Applicant.objects.filter(
            contact_number=contact_number,
        ).exclude(
            background_info__birthday=background_info.birthday
        ).exists()

        # Same birthday + contact, different name
        conflict_identity_name = Applicant.objects.filter(
            contact_number=contact_number,
            background_info__birthday=background_info.birthday,
        ).exclude(
            background_info__first_name__iexact=background_info.first_name,
            background_info__last_name__iexact=background_info.last_name,
        ).exists()

        # Contact reused by multiple identities
        distinct_people_using_contact = Applicant.objects.filter(
            contact_number=contact_number
        ).values(
            "background_info__first_name",
            "background_info__last_name",
            "background_info__birthday",
        ).distinct().count()

        # Decision tree
        if conflict_contact_birthday:
            identity_status = "SUSPICIOUS"
            identity_notes = "Same contact number used with different birthday"

        elif conflict_identity_name:
            identity_status = "SUSPICIOUS"
            identity_notes = "Same birthday and contact used with different name"

        elif distinct_people_using_contact >= 3:
            identity_status = "SUSPICIOUS"
            identity_notes = "Contact number reused by multiple identities"

        elif history_count >= 2:
            identity_status = "REVIEWED"
            identity_notes = "Repeat beneficiary with assistance history"

        print(f"IDENTITY STATUS: {identity_status} | {identity_notes}")

        # -----------------------------------------------
        # 3. Create or Update Applicant tied to this BI
        # -----------------------------------------------
        applicant = Applicant.objects.filter(background_info=background_info).first()

        if applicant:
            print(f"Updating existing Applicant ID: {applicant.id}")
            for key, value in validated_data.items():
                setattr(applicant, key, value)

            applicant.staff = staff_user
            applicant.created_at = created_at
            applicant.date_filled = now 

            previous_status = applicant.identity_status or "NEW"

            if SEVERITY_ORDER[identity_status] < SEVERITY_ORDER[previous_status]:
                identity_status = previous_status
                identity_notes = applicant.identity_notes

            applicant.identity_status = identity_status
            applicant.identity_notes = identity_notes   
            applicant.save()
        else:
            print("Creating NEW Applicant record")
            applicant = Applicant.objects.create(
                background_info=background_info,
                staff=staff_user,
                created_at=created_at,
                date_filled=now,
                identity_status=identity_status,
                identity_notes=identity_notes,
                **validated_data
            )

        print(f"Applicant saved. ID: {applicant.id}  | date_filled: {applicant.date_filled}")
        print("====== APPLICANT CREATE END ======\n")

        # -----------------------------------------------
        # 4. Representative handling
        # -----------------------------------------------
        if rep_data and validated_data.get("applicant_type") == "Representative":
            rep_bg_data = rep_data.pop("background_info")
            rep_bg = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)

            Representative.objects.update_or_create(
                applicant=applicant,
                defaults={
                    "background_info": rep_bg,
                    "relationship": rep_data["relationship"],
                    "contact_number": rep_data.get("contact_number"),
                },
            )

        return applicant



    # ------------------------ UPDATE FIXED ------------------------
    def update(self, instance, validated_data):

        # Update background info
        bg_data = validated_data.pop("background_info", None)
        if bg_data:
            bg_instance = instance.background_info
            for attr, value in bg_data.items():
                setattr(bg_instance, attr, value)
            bg_instance.save()

        # Update/create representative
        rep_data = validated_data.pop("representative", None)
        if rep_data:
            # rep_data may include background_info (dict)
            rep_bg_data = rep_data.pop("background_info", None)
            if rep_bg_data:
                # create or reuse BackgroundInfo safely via serializer helper
                rep_bg_instance = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)
            else:
                rep_bg_instance = None

            # update or create Representative row
            rep_defaults = {
                "background_info": rep_bg_instance if rep_bg_instance else getattr(instance.representative, "background_info", None),
                "relationship": rep_data.get("relationship"),
                "contact_number": rep_data.get("contact_number")
            }
            Representative.objects.update_or_create(
                applicant=instance,
                defaults=rep_defaults
            )

        # Update applicant normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data['representative'] = RepresentativeSerializer(instance.representative).data
        except Representative.DoesNotExist:
            data['representative'] = None
        return data


