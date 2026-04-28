# TailorGo Updated Backend API Documentation

This document is for frontend integration with the current `updatedBackend` APIs.

## Base URL

Local server:

```text
http://localhost:<PORT>/api
```

Routes are mounted from `src/server.js` as:

```text
/api/v1/user
/api/v1/tailor
```

## Common Rules

- Normal JSON APIs use `Content-Type: application/json`.
- Tailor register init uses `Content-Type: multipart/form-data` because it accepts images.
- All API responses are JSON.
- Login APIs set auth tokens in cookies:
  - `AccessToken`
  - `refreshToken`
- Frontend should send requests with credentials enabled when cookies are needed:

```js
// fetch
fetch(url, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});

// axios
axios.post(url, data, { withCredentials: true });
```

## Error Response Pattern

The backend currently does not use one single error format everywhere. Frontend should handle these shapes:

```json
{
  "message": "Error message"
}
```

```json
{
  "error": "Error message"
}
```

```json
{
  "success": false,
  "error": "Error message"
}
```

Validation errors usually return the first validation message only.

## OTP Rules

- OTP is sent to the user's email.
- OTP is stored in `OtpValidate`.
- OTP expires after 10 minutes.
- OTP code is a string.

---

# User APIs

## 1. User Register Init

Creates a pending customer account and sends OTP to email.

```text
POST /api/v1/user/register/init
```

### Request Type

```text
application/json
```

### Request Body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | Yes | Cannot be empty |
| `email` | string | Yes | Must be valid email |
| `phoneNo` | string | Yes | Cannot be empty |
| `password` | string | Yes | Minimum 6 characters |

### Example Request

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phoneNo": "9876543210",
  "password": "password123"
}
```

### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "message": "Otp send SuccessFully"
}
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "message": "Invalid email format"
}
```

```json
{
  "message": "Password must be at least 6 characters long"
}
```

```json
{
  "message": "Email already exists"
}
```

### Frontend Notes

- After success, show OTP screen.
- Do not expect user data in response.
- Account status remains `pending` until OTP verification.

## 2. User Register Verify

Verifies OTP and activates customer account.

```text
POST /api/v1/user/register/verify
```

### Request Type

```text
application/json
```

### Request Body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be valid email |
| `code` | string | Yes | OTP received on email |

### Example Request

```json
{
  "email": "rahul@example.com",
  "code": "123456"
}
```

### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "message": "User verified successfully"
}
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "message": "Invalid or expired code"
}
```

```json
{
  "message": "User not found"
}
```

### Frontend Notes

- After success, redirect user to login.
- Current controller does not return user details or token on verification.

## 3. User Login

Logs in customer and sets auth cookies.

```text
POST /api/v1/user/login
```

### Request Type

```text
application/json
```

### Request Body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be valid email |
| `password` | string | Yes | Must be string |

### Example Request

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

### Success Response

Status: `200 OK`

Response body:

```json
{
  "message": "Login success",
  "status": true
}
```

Response cookies:

```text
AccessToken=<jwt>
refreshToken=<refresh-token>
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "message": "email is required"
}
```

```json
{
  "error": "user not exist with this email"
}
```

```json
{
  "error": "Invalid password"
}
```

### Frontend Notes

- Use `credentials: "include"` or `withCredentials: true`.
- Backend does not return token in JSON body.
- Current login service does not block customers whose `status` is still `pending`.

---

# Tailor APIs

## 1. Tailor Register Init

Creates a pending tailor account, uploads verification/work images to Cloudinary, and sends OTP to email.

```text
POST /api/v1/tailor/register/init
```

### Request Type

```text
multipart/form-data
```

### Text Fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | Yes | Cannot be empty |
| `email` | string | Yes | Must be valid email |
| `phoneNo` | string | Yes | Cannot be empty |
| `password` | string | Yes | Minimum 6 characters |
| `shopName` | string | Yes | Cannot be empty |
| `shopAddress` | string | No | Shop location/address |
| `servicesOffered` | array | Yes | Minimum 1 service |
| `servicesOffered[].serviceType` | string | Yes | Cannot be empty |
| `servicesOffered[].price` | number | Yes | Must be numeric |
| `verificationType` | string | Yes | `adharCard` or `voterId` in validator |
| `age` | number | Yes | 18 to 70 |
| `gender` | string | Yes | `male`, `female`, or `other` |
| `experience` | number/string | Yes | Cannot be empty |

### File Fields

| Field | Type | Required | Limit | Notes |
| --- | --- | --- | --- | --- |
| `verificationPhotos` | image files | Recommended | Max 2 | Allowed: `.jpeg`, `.jpg`, `.png` |
| `workExperiencePhotos` | image files | Recommended | Max 10 | Allowed: `.jpeg`, `.jpg`, `.png` |

### Example FormData

```js
const formData = new FormData();

formData.append("name", "Rahul Tailor");
formData.append("email", "tailor@example.com");
formData.append("phoneNo", "9876543210");
formData.append("password", "password123");
formData.append("shopName", "Rahul Tailors");
formData.append("shopAddress", "Main Road, Ranchi");
formData.append("verificationType", "adharCard");
formData.append("age", "25");
formData.append("gender", "male");
formData.append("experience", "5");

formData.append("servicesOffered[0][serviceType]", "Shirt Stitching");
formData.append("servicesOffered[0][price]", "300");
formData.append("servicesOffered[1][serviceType]", "Pant Stitching");
formData.append("servicesOffered[1][price]", "500");

formData.append("verificationPhotos", verificationFile1);
formData.append("verificationPhotos", verificationFile2);
formData.append("workExperiencePhotos", workFile1);
```

### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "message": "Otp send Successfully"
}
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "message": "Invalid email format"
}
```

```json
{
  "message": "Gender must be either male, female or other"
}
```

```json
{
  "success": false,
  "error": "Tailor with this email already exists"
}
```

```json
{
  "success": false,
  "error": "files and tailorData is required"
}
```

### Frontend Notes

- Do not manually set `Content-Type` with FormData. Browser will set multipart boundary automatically.
- After success, show OTP screen.
- API does not return created tailor data.
- Uploaded files are saved locally first and then uploaded to Cloudinary.

## 2. Tailor Register Verify

Verifies tailor OTP and activates tailor account status.

```text
POST /api/v1/tailor/register/verify
```

### Request Type

```text
application/json
```

### Request Body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be valid email |
| `code` | string | Yes | Must be exactly 6 characters |

### Example Request

```json
{
  "email": "tailor@example.com",
  "code": "123456"
}
```

### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "message": "Account activated"
}
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "error": "Invalid email format"
}
```

```json
{
  "error": "code must be 6 characters long"
}
```

```json
{
  "error": "Invalid or expired code"
}
```

```json
{
  "error": "Tailor not found"
}
```

### Frontend Notes

- After success, tailor `status` becomes `active`.
- Current login controller also requires `verificationStatus` to be `verified`.
- OTP verification does not set `verificationStatus` to `verified`, so tailor login can still return `403` until backend/admin verification flow updates it.

## 3. Tailor Login

Logs in tailor and sets auth cookies only if tailor verification status is verified.

```text
POST /api/v1/tailor/login
```

### Request Type

```text
application/json
```

### Request Body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be valid email |
| `password` | string | Yes | Must be string |

### Example Request

```json
{
  "email": "tailor@example.com",
  "password": "password123"
}
```

### Success Response

Status: `200 OK`

Response body:

```json
{
  "message": "Login success",
  "status": true
}
```

Response cookies:

```text
AccessToken=<jwt>
refreshToken=<refresh-token>
```

### Error Responses

Status: `400 Bad Request`

```json
{
  "message": "email is required"
}
```

```json
{
  "error": "user not exist with this email"
}
```

```json
{
  "error": "Invalid password"
}
```

Status: `403 Forbidden`

```json
{
  "message": "Please Verify your Account"
}
```

### Frontend Notes

- Use `credentials: "include"` or `withCredentials: true`.
- Backend does not return token in JSON body.
- If response status is `403`, show a verification-pending message.

---

# Current Backend Integration Notes

These are important for frontend/backend coordination before final integration:

1. In `tailor.router.js`, upload field names are currently written as unquoted identifiers:

```js
upload.fields([{ name: verificationphotos, maxCount: 2 }, { name: workexperiencephotos, maxCount: 10 }])
```

They should be string field names and should match the service:

```js
upload.fields([
  { name: "verificationPhotos", maxCount: 2 },
  { name: "workExperiencePhotos", maxCount: 10 }
])
```

2. Tailor validator allows `verificationType: "adharCard"`, but Tailor model enum is `["aadharCard", "voterId"]`. One spelling should be finalized.

3. Login cookies are intended to be HTTP-only cookies. The controller currently passes cookie option functions instead of calling them. Backend should use `getAccessTokenOptions()` and `getRefreshTokenOptions()`.

4. Tailor OTP verify sets `status = "active"`, but tailor login checks `verificationStatus === "verified"`. Frontend should expect possible `403` after OTP until verification workflow is completed.

5. User model has field `pnoneNo`, but register service sends `phoneNo`. This may prevent phone number from being saved correctly.

6. Password hashing hooks currently check `if (!this.isModified("password"))`. Usually this condition should be `if (this.isModified("password"))`. Confirm before production use.

7. `ENV.CLOUDINARY_API_SECRET` uses `process.eventNames.CLOUDINARY_API_SECRET`; it should probably be `process.env.CLOUDINARY_API_SECRET`.

8. `verificationQueue.add("verificationqueue",)` in tailor verify is incomplete and does not currently send `queueData`.

