import os
import json
import boto3
from botocore.client import Config
from datetime import datetime, timezone

class R2Storage:
    def __init__(self, app_name):
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "my-apps-data")
        self.app_name = app_name
        self.endpoint = os.getenv("R2_ENDPOINT")
        self.access_key = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
        
        self.s3 = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=Config(signature_version="s3v4"),
            region_name="auto"
        ) if self.endpoint and self.access_key else None

    def _get_key(self, user_id):
        return f"agents_history/{self.app_name}/{user_id}.json"

    def get_history(self, user_id):
        if not self.s3: return []
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=self._get_key(user_id))
            return json.loads(response["Body"].read().decode("utf-8"))
        except Exception:
            return []

    def save_history(self, user_id, history):
        if not self.s3: return
        try:
            # Keep only last 50
            history = history[-50:]
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=self._get_key(user_id),
                Body=json.dumps(history, default=str),
                ContentType="application/json"
            )
        except Exception as e:
            print(f"R2 Save Error: {e}")

    def delete_history(self, user_id):
        if not self.s3: return
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=self._get_key(user_id))
        except Exception:
            pass
