# Frontend S3 CI/CD Setup

This project now includes a GitHub Actions pipeline that builds `frontend/` and deploys it to S3.

## 1) Required GitHub repository variables

Set these in: `Settings -> Secrets and variables -> Actions -> Variables`

- `AWS_REGION` (example: `us-east-1`)
- `S3_BUCKET_NAME` (example: `my-frontend-prod-bucket`)
- `REACT_APP_BACKEND_URL` (example: `https://api.mybank.com/`)
- `CLOUDFRONT_DISTRIBUTION_ID` (optional, for cache invalidation)

## 2) Required GitHub repository secrets

Set these in: `Settings -> Secrets and variables -> Actions -> Secrets`

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 3) Workflow behavior

Workflow file: `.github/workflows/frontend-s3-deploy.yml`

- Triggers on push to `main` or `master` when `frontend/**` changes
- Supports manual trigger with `workflow_dispatch`
- Runs:
  - `npm ci --prefix frontend`
  - `npm run build --prefix frontend`
  - `aws s3 sync frontend/build s3://$S3_BUCKET_NAME --delete`
  - Uploads `index.html` with no-cache headers
  - Invalidates CloudFront if distribution ID is provided

## 4) AWS permissions needed for the IAM user

Minimum required:

- `s3:ListBucket` on the bucket
- `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` on bucket objects
- `cloudfront:CreateInvalidation` (only if using CloudFront invalidation)
