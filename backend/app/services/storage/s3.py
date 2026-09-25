"""
S3-Compatible Storage Backend (future implementation).
Supports AWS S3, Cloudflare R2, MinIO, Backblaze B2 via boto3.
The interface is fully specified — zero application changes needed to switch from Local.
"""
from __future__ import annotations

from app.services.storage.base import StorageBackend


class S3StorageBackend(StorageBackend):
    """
    S3-compatible storage backend.
    Requires: boto3, botocore
    Install: pip install boto3

    Environment variables:
        STORAGE_S3_BUCKET
        STORAGE_S3_ENDPOINT  (empty = AWS; set for R2/MinIO)
        STORAGE_S3_ACCESS_KEY
        STORAGE_S3_SECRET_KEY
        STORAGE_S3_REGION
    """

    def __init__(
        self,
        bucket: str,
        endpoint_url: str | None = None,
        access_key: str = "",
        secret_key: str = "",
        region: str = "auto",
        public_base_url: str = "",
    ) -> None:
        self.bucket = bucket
        self.endpoint_url = endpoint_url or None
        self.region = region
        self.public_base_url = public_base_url.rstrip("/")
        self._client = None  # lazy init — boto3 imported on first use

    def _get_client(self):
        if self._client is None:
            try:
                import boto3
            except ImportError as e:
                raise ImportError(
                    "boto3 is required for S3 storage. Install: pip install boto3"
                ) from e
            from app.core.config import settings
            self._client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=settings.storage_s3_access_key or None,
                aws_secret_access_key=settings.storage_s3_secret_key or None,
                region_name=self.region,
            )
        return self._client

    async def put(
        self, key: str, data: bytes, content_type: str = "application/octet-stream"
    ) -> str:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            ),
        )
        return self.public_url(key)

    async def get(self, key: str) -> bytes:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(
                None,
                lambda: client.get_object(Bucket=self.bucket, Key=key),
            )
            return response["Body"].read()
        except Exception as e:
            if "NoSuchKey" in str(e) or "404" in str(e):
                raise FileNotFoundError(f"S3 key not found: {key}") from e
            raise

    async def delete(self, key: str) -> None:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: client.delete_object(Bucket=self.bucket, Key=key),
        )

    async def exists(self, key: str) -> bool:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: client.head_object(Bucket=self.bucket, Key=key),
            )
            return True
        except Exception:
            return False

    async def list_prefix(self, prefix: str) -> list[str]:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.list_objects_v2(Bucket=self.bucket, Prefix=prefix),
        )
        return [obj["Key"] for obj in response.get("Contents", [])]

    def public_url(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"
        return f"https://{self.bucket}.s3.amazonaws.com/{key}"

    async def get_size(self, key: str) -> int:
        import asyncio
        client = self._get_client()
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.head_object(Bucket=self.bucket, Key=key),
        )
        return response["ContentLength"]
