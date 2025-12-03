import os
import datetime
import subprocess
import sys
from django.conf import settings
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Automated database backup for PostgreSQL, MySQL, and SQLite."

    def handle(self, *args, **kwargs):
        now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        backup_dir = os.path.join(settings.BASE_DIR, "backups")
        os.makedirs(backup_dir, exist_ok=True)

        db = settings.DATABASES["default"]
        db_engine = db.get("ENGINE", "")

        try:
            if "postgresql" in db_engine:
                self.backup_postgresql(db, backup_dir, now)
            elif "mysql" in db_engine:
                self.backup_mysql(db, backup_dir, now)
            elif "sqlite" in db_engine:
                self.backup_sqlite(db, backup_dir, now)
            else:
                self.stderr.write(self.style.ERROR(f"Unsupported database engine: {db_engine}"))

        except FileNotFoundError as e:
            self.stderr.write(self.style.ERROR(f"Backup failed: Command not found. Make sure client tools are installed and in your system's PATH. Error: {e}"))
        except subprocess.CalledProcessError as e:
            error_message = e.stderr or f"Command '{' '.join(e.cmd)}' returned non-zero exit status {e.returncode}."
            self.stderr.write(self.style.ERROR(f"Backup failed: {error_message}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))

    def backup_postgresql(self, db_settings, backup_dir, timestamp):
        filename = f"backup_pg_{timestamp}.sql"
        filepath = os.path.join(backup_dir, filename)

        cmd = [
            'pg_dump',
            '--username', db_settings["USER"],
            '--host', db_settings["HOST"],
            '--port', str(db_settings["PORT"]),
            '--dbname', db_settings["NAME"]
        ]
        
        env = os.environ.copy()
        if db_settings.get("PASSWORD"):
            env['PGPASSWORD'] = db_settings["PASSWORD"]

        with open(filepath, 'w', encoding='utf-8') as f_out:
            subprocess.run(
                cmd,
                stdout=f_out,
                stderr=subprocess.PIPE,
                check=True,
                env=env,
                text=True
            )
        
        self.stdout.write(self.style.SUCCESS(f"PostgreSQL backup saved: {filepath}"))

    def backup_mysql(self, db_settings, backup_dir, timestamp):
        filename = f"backup_mysql_{timestamp}.sql"
        filepath = os.path.join(backup_dir, filename)

        cmd = [
            'mysqldump',
            '--user', db_settings["USER"],
            '--host', db_settings["HOST"],
            '--port', str(db_settings["PORT"]),
            db_settings["NAME"]
        ]

        env = os.environ.copy()
        if db_settings.get("PASSWORD"):
            env['MYSQL_PWD'] = db_settings["PASSWORD"]
        
        with open(filepath, 'w', encoding='utf-8') as f_out:
            subprocess.run(
                cmd,
                stdout=f_out,
                stderr=subprocess.PIPE,
                check=True,
                env=env,
                text=True
            )
        
        self.stdout.write(self.style.SUCCESS(f"MySQL backup saved: {filepath}"))

    def backup_sqlite(self, db_settings, backup_dir, timestamp):
        db_path = db_settings["NAME"]
        if not os.path.isabs(db_path):
            db_path = os.path.join(settings.BASE_DIR, db_path)

        if not os.path.exists(db_path):
            self.stderr.write(self.style.ERROR(f"SQLite database not found at: {db_path}"))
            return

        filename = f"backup_sqlite_{timestamp}.sqlite3"
        filepath = os.path.join(backup_dir, filename)
        
        copy_cmd = 'copy' if sys.platform == 'win32' else 'cp'
        
        subprocess.run(
            [copy_cmd, db_path, filepath],
            check=True,
            shell=True,
            capture_output=True
        )

        self.stdout.write(self.style.SUCCESS(f"SQLite backup saved: {filepath}"))
