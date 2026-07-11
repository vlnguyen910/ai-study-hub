param(
  [string]$ApiBaseUrl = "http://localhost:8080/api/v1"
)

$ErrorActionPreference = "Stop"

$accounts = @(
  @{ Email = "admin@gmail.com"; Name = "ADMIN" },
  @{ Email = "moderator@gmail.com"; Name = "MODERATOR" },
  @{ Email = "user@gmail.com"; Name = "Le Van A" },
  @{ Email = "user1@gmail.com"; Name = "Le Van B" },
  @{ Email = "user2@gmail.com"; Name = "Le Van C" },
  @{ Email = "user3@gmail.com"; Name = "Le Van D" },
  @{ Email = "user4@gmail.com"; Name = "Le Van E" }
)

$samplePdfUrl = "https://res.cloudinary.com/ddxstobvd/image/upload/v1783747368/seed/attention-is-all-you-need.pdf"
$samplePdfSize = 2215244
$results = @()

foreach ($account in $accounts) {
  $slug = ($account.Email.Split("@")[0] -replace "[^a-zA-Z0-9-]", "-").ToLowerInvariant()
  $deviceId = "document-seed-$slug"
  $signinBody = @{
    email = $account.Email
    password = "12345678"
    deviceId = $deviceId
  } | ConvertTo-Json

  $signin = Invoke-RestMethod -Method Post -Uri "$ApiBaseUrl/auth/mobile-signin" -ContentType "application/json" -Body $signinBody
  $token = $signin.data.accessToken
  if (-not $token) {
    throw "Login succeeded without an access token for $($account.Email)"
  }

  $headers = @{ Authorization = "Bearer $token" }
  $mine = Invoke-RestMethod -Method Get -Uri "$ApiBaseUrl/documents/me?page=1&limit=100" -Headers $headers
  $existingPublicIds = @($mine.data.documents | ForEach-Object { $_.publicId })
  $created = 0

  for ($index = 1; $index -le 5; $index++) {
    $publicId = "seed/accounts/$slug/document-$index"
    if ($existingPublicIds -contains $publicId) {
      continue
    }

    $documentBody = @{
      title = "$($account.Name) - Attention Is All You Need ($index)"
      description = "Bai bao nghien cuu ve kien truc Transformer, Attention Is All You Need, ban tai lieu so $index cua $($account.Email)."
      fileUrl = $samplePdfUrl
      publicId = $publicId
      sizeInBytes = $samplePdfSize
      format = "pdf"
      resourceType = "image"
      isPublic = $false
    } | ConvertTo-Json

    Invoke-RestMethod -Method Post -Uri "$ApiBaseUrl/documents" -Headers $headers -ContentType "application/json" -Body $documentBody | Out-Null
    $created++
  }

  $verify = Invoke-RestMethod -Method Get -Uri "$ApiBaseUrl/documents/me?page=1&limit=100" -Headers $headers
  $seededCount = @($verify.data.documents | Where-Object { $_.publicId -like "seed/accounts/$slug/*" }).Count
  $results += [PSCustomObject]@{
    Email = $account.Email
    Created = $created
    SeededDocuments = $seededCount
  }
}

$results | Format-Table -AutoSize
