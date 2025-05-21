import requests
from django.core.management.base import BaseCommand
from api.models import Region, Province, City, Barangay

PSGC_BASE = "https://psgc.gitlab.io/api"
CITIES = [
    {"name": "Lucena City", "code": "045624000"},
    {"name": "Sariaya", "code": "045645000"},
    {"name": "Candelaria", "code": "045608000"},
    {"name": "Tiaong", "code": "045648000"},
    {"name": "San Antonio", "code": "045641000"},
    {"name": "Dolores", "code": "045615000"},
]

class Command(BaseCommand):
    help = "Import PSGC barangays for 6 selected cities in Quezon"

    def handle(self, *args, **kwargs):
        region, _ = Region.objects.get_or_create(name="Region IV-A")
        province, _ = Province.objects.get_or_create(name="Quezon", region=region)

        for city in CITIES:
            city_obj, _ = City.objects.get_or_create(
                name=city["name"],
                province=province,
                defaults={"psgc_code": city["code"]},
            )

            url = f"{PSGC_BASE}/cities-municipalities/{city['code']}/barangays/"
            response = requests.get(url)

            if response.status_code == 200:
                barangays = response.json()
                for brgy in barangays:
                    name = brgy["name"].replace(" (Pob.)", "").strip()
                    code = brgy["code"]
                    Barangay.objects.get_or_create(
                        name=name,
                        city=city_obj,
                        defaults={"psgc_code": code}
                    )
                self.stdout.write(self.style.SUCCESS(f"✓ Barangays loaded for {city['name']}"))
            else:
                self.stdout.write(self.style.ERROR(f"✗ Failed for {city['name']}"))
