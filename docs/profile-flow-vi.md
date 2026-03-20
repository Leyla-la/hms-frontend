# Tài liệu luồng Profile (Doctor/Patient) – HMS Frontend

Ngày cập nhật: 2026-03-14

## 1) Những file đã thay đổi / thêm mới

### 1.1. File **modified** (đã có trước đó)
- `public/index.html`
  - Thêm Google Fonts (Google Sans + Merriweather) để khớp theme ở `src/App.tsx`.
- `src/Routes/AppRoutes.tsx`
  - Bổ sung route cho profile:
    - Patient: `/patient/profile` → `PatientProfilePage`
    - Doctor: `/doctor/profile` → `DoctorProfilePage`
- `src/Interceptor/AxiosInterceptor.tsx`
  - Cấu hình `axiosInstance` có `baseURL` và tự gắn header `Authorization: Bearer <token>` từ `localStorage`.
- `src/Data/DropdownData.tsx`
  - Bổ sung dữ liệu dropdown cho blood group + specialization + department.
- `src/Components/Doctor/Profile/Profile.tsx`
  - Màn hình xem/sửa profile Doctor (fetch data, edit mode, validate, submit).
- `src/Components/Patient/Profile/Profile.tsx`
  - Màn hình xem/sửa profile Patient (fetch data, edit mode, validate, xử lý allergies/chronicDiseases là mảng).
- `src/Components/Doctor/Sidebar/Sidebar.tsx`
  - Menu Doctor có link vào `/doctor/profile`.

### 1.2. File **new/untracked** (file mới)
- `src/Service/DoctorProfileService.tsx`
  - API client gọi backend lấy/cập nhật doctor profile.
- `src/Service/PatientProfileService.tsx`
  - API client gọi backend lấy/cập nhật patient profile.
- `src/Utility/DateUtility.tsx`
  - Format ngày để hiển thị và để gửi backend.
- `src/Utility/OtherUtility.tsx`
  - Helper `arrayToCSV` để render mảng ra text.

### 1.3. File **new/untracked** trong `public/` (tài nguyên)
- `public/261CDC5B42B94D77B46FCF838C8EEBAC_Signed.pdf`
- `public/3f93afa1-db82-4186-b5f2-6920a93acae7.jpg`

Ghi chú: 2 file này hiện đang ở trạng thái *untracked*. Cân nhắc xem có cần commit vào repo hay thêm vào `.gitignore` (tuỳ mục đích: demo/test hay asset chính thức).

---

## 2) Tổng quan kiến trúc chạy

### 2.1. Entry point và nơi app bắt đầu chạy
- `src/index.tsx` là entry point của CRA.
- `index.tsx` render `<App />` vào `#root` trong `public/index.html`.

Pipeline:

`public/index.html` → `src/index.tsx` → `src/App.tsx` → `src/Routes/AppRoutes.tsx` → các layout/page/component.

### 2.2. App level providers
Trong `src/App.tsx`:
- `<Provider store={Store}>` inject Redux store (`src/Utility/Store.tsx`).
- `<MantineProvider theme={theme}>` inject theme (fontFamily, colors, …).
- `<Notifications />` enable toast (dùng trong `NotificationUtil.tsx`).
- `<AppRoutes />` là router root.

---

## 3) Luồng auth/token (để hiểu vì sao API gọi được)

### 3.1. Login: token đi từ đâu ra?
File: `src/Pages/LoginPage.tsx`
- Người dùng nhập `email/password`.
- `handleSubmit(values)` gọi `loginUser(values)` trong `src/Service/UserService.tsx`.
- Backend trả về **token** (đang được dùng như JWT string).
- Frontend:
  - `dispatch(setToken(token))` (slice `src/Slices/JwtSlice.tsx`) → lưu vào Redux state `jwt` và đồng thời lưu `localStorage.setItem('token', token)`.
  - `jwtDecode(token)` → object user.
  - `dispatch(setUser(user))` (slice `src/Slices/UserSlice.tsx`) → lưu user vào Redux state `user`.

### 3.2. ProtectedRoute/PublicRoute hoạt động như thế nào?
- `src/Routes/ProtectedRoute.tsx`
  - Đọc `state.jwt`.
  - Nếu có token: render children.
  - Nếu không có: `<Navigate to="/login" />`.

- `src/Routes/PublicRoute.tsx`
  - Nếu đã có token: decode và redirect sang `/${role}/dashboard`.
  - Nếu không có token: render children (login/register).

### 3.3. Vì sao API tự có Authorization?
File: `src/Interceptor/AxiosInterceptor.tsx`
- Tạo `axiosInstance` với:
  - `baseURL: 'http://localhost:9000'`
  - interceptor request:
    - lấy `token` từ `localStorage`.
    - nếu có → gắn header: `Authorization = Bearer ${token}`

Ý nghĩa:
- Bạn không cần truyền token thủ công vào từng API call.
- Mọi service dùng `axiosInstance` sẽ tự có header.

Chuỗi dữ liệu token:
- Backend trả JWT → frontend lưu `localStorage` + Redux (`JwtSlice`).
- Khi bấm vào các page trong vùng protected, component gọi service.
- Service gọi `axiosInstance`.
- Interceptor đọc token từ `localStorage` và gắn `Authorization`.
- Backend nhận token để xác thực và trả data.

---

## 4) Routing và “chạy từ đâu tới đâu” cho Profile

### 4.1. Doctor Profile route
File: `src/Routes/AppRoutes.tsx`
- Khi user truy cập `/doctor/profile`:
  - Route `/doctor` render `<ProtectedRoute><DoctorDashboard /></ProtectedRoute>`
  - `DoctorDashboard` (file `src/Layout/DoctorDashboard.tsx`) render:
    - `<Sidebar />` (doctor sidebar)
    - `<Header />`
    - `<Outlet />` ← nơi các nested route hiển thị
  - Nested route `profile` render `<DoctorProfilePage />`
  - `DoctorProfilePage` (file `src/Pages/Doctor/DoctorProfilePage.tsx`) render `<Components/Doctor/Profile/Profile />`

Chuỗi component:

`AppRoutes` → `ProtectedRoute` → `DoctorDashboard` → `Outlet` → `DoctorProfilePage` → `Doctor/Profile/Profile`

### 4.2. Patient Profile route
Tương tự, `/patient/profile` chạy theo chuỗi:

`AppRoutes` → `ProtectedRoute` → `PatientDashboard` → `Outlet` → `PatientProfilePage` → `Patient/Profile/Profile`

---

## 5) Doctor Profile – chi tiết pipeline dữ liệu

File chính: `src/Components/Doctor/Profile/Profile.tsx`

### 5.1. Nguồn dữ liệu user và profileId
- `const doctor = useSelector((state: any) => state.user);`
- Kỳ vọng `doctor.profileId` đã có sẵn sau khi login (từ JWT decode).

Input ở level component:
- Không nhận props.
- Lấy user từ Redux.

### 5.2. Fetch profile (GET)
Code:
- `useEffect(() => { ... }, [doctor.profileId])`
- Nếu không có `doctor.profileId` → return.
- Gọi `getDoctor(doctor.profileId)`.

`getDoctor` nằm ở `src/Service/DoctorProfileService.tsx`:
- Input: `id: any` (thực tế nên là `string | number`).
- API: `axiosInstance.get(`/profile/doctor/get/${id}`)`
- Output: `response.data` (Promise resolve data).

Pipeline “dấu chấm” (promise chain):
- `getDoctor(id)`
  - `.then((data) => setProfile({ ...data }))`
  - `.catch((error) => console.error(...))`

### 5.3. Render (view mode)
- State `profile` chứa dữ liệu lấy từ backend.
- `editMode = false`:
  - Render `<Table>` hiển thị:
    - `dob` dùng `formatDate(profile.dob)`
    - các field khác hiển thị `profile.xxx ?? '-'`

`formatDate` ở `src/Utility/DateUtility.tsx`:
- Input: `dateString: any` (thực tế nên là `string | Date`).
- Output: string dạng `"D Month YYYY"` (ví dụ `"14 March 2026"`) hoặc `undefined` nếu không có.

### 5.4. Bật edit mode
- Khi bấm nút `Edit`:
  - `handleEdit()`
  - `form.setValues({ ...profile, dob: profile.dob ? new Date(profile.dob) : undefined })`
  - `setEditMode(true)`

Tại sao phải `new Date(profile.dob)`?
- Mantine `DateInput` làm việc tốt nhất với kiểu `Date`.
- Backend thường trả `dob` là string (ISO hoặc `YYYY-MM-DD`).

### 5.5. Validate và submit (PUT)
- Khi bấm `Save`:
  - `handleSubmit()`
  - `values = form.getValues()`
  - `form.validate()`
  - Nếu `!form.isValid()` → stop.
  - Gọi:

```ts
updateDoctor({ ...profile, ...values, dob: formatLocalDate(values.dob) })
```

`formatLocalDate` ở `src/Utility/DateUtility.tsx`:
- Input: `dateValue` (Date hoặc parseable).
- Output: string `YYYY-MM-DD` theo locale `'en-CA'`, hoặc `null` nếu không có.

Vì sao cần `YYYY-MM-DD`?
- Nhiều backend map sang `LocalDate` (Java) hoặc date-only field, yêu cầu format chuẩn.
- Tránh timezone shift khi gửi ISO datetime.

`updateDoctor` ở `src/Service/DoctorProfileService.tsx`:
- Input: object doctor (payload).
- API: `PUT /profile/doctor/update` với body = payload.
- Output: `response.data`.

#### 5.5.1. Mantine `useForm` (uncontrolled) đang hoạt động ra sao?
Trong `Doctor/Profile/Profile.tsx` bạn dùng:
- `useForm({ mode: 'uncontrolled', initialValues, validate })`
- Các input dùng `...form.getInputProps('fieldName')`

Ý nghĩa của `uncontrolled`:
- Giá trị thật nằm trong DOM input, không bị React state “control” mỗi lần gõ.
- Khi cần lấy toàn bộ dữ liệu, bạn gọi `form.getValues()`.
- Khi validate, bạn gọi `form.validate()` rồi kiểm tra `form.isValid()`.

Tại sao làm vậy?
- Với form dài, uncontrolled thường nhẹ hơn controlled (ít re-render).
- Tránh phải tự quản lý `value/onChange` cho từng input.

### 5.6. Success/Error UI
- Success:
  - `successNotification('Profile updated successfully')`
  - `setProfile({ ...profile, ...values })`
  - `setEditMode(false)`
- Error:
  - `errorNotification(error.response?.data?.errorMessage || 'Failed to update profile')`

Notification helpers nằm ở `src/Utility/NotificationUtil.tsx`.

### 5.7. Ví dụ payload để bạn hình dung “data transfer”

#### 5.7.1. GET Doctor profile
Request (ví dụ):
- Method: `GET`
- URL: `http://localhost:9000/profile/doctor/get/<profileId>`
- Headers: `Authorization: Bearer <token>`

Response (ví dụ dạng, tuỳ backend):
```json
{
  "id": 123,
  "dob": "1995-06-20",
  "phone": "0987654321",
  "address": "HCM",
  "licenseNo": "123456789012",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "totalExp": 5
}
```

#### 5.7.2. PUT Doctor profile update
Request body (ví dụ):
```json
{
  "id": 123,
  "dob": "1995-06-20",
  "phone": "0987654321",
  "address": "HCM",
  "licenseNo": "123456789012",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "totalExp": 6
}
```

Ghi chú kiểu dữ liệu:
- `dob`: gửi string `YYYY-MM-DD` (dùng `formatLocalDate`).
- `phone/licenseNo`: hiện validate đang dùng regex chỉ cho phép số và đúng độ dài.

---

## 6) Patient Profile – chi tiết pipeline dữ liệu

File chính: `src/Components/Patient/Profile/Profile.tsx`

### 6.1. Fetch profile (GET)
- `const patient = useSelector((state: any) => state.user);`
- `useEffect(() => { getPatient(patient.profileId) ... }, [patient.profileId])`

`getPatient` ở `src/Service/PatientProfileService.tsx`:
- API: `GET /profile/patient/get/${id}`
- Output: `response.data`

### 6.2. Chuyển đổi allergies/chronicDiseases (backend string ↔ frontend array)
Ngay sau khi fetch:

```ts
setProfile({
  ...data,
  allergies: data.allergies ? JSON.parse(data.allergies) : null,
  chronicDiseases: data.chronicDiseases ? JSON.parse(data.chronicDiseases) : null,
});
```

Ý nghĩa:
- Backend đang lưu 2 field này dưới dạng JSON string (ví dụ: `"[\"Peanut\",\"Dust\"]"`).
- UI `TagsInput` cần dạng `string[]`.

Rủi ro:
- Nếu backend trả JSON không hợp lệ → `JSON.parse` sẽ throw.

### 6.3. View mode
- `bloodGroup` hiển thị bằng `bloodGroupMap[profile.bloodGroup]`.
  - Map nằm trong `src/Data/DropdownData.tsx`.
- `allergies`, `chronicDiseases` hiển thị bằng `arrayToCSV(profile.allergies)`.
  - `arrayToCSV` ở `src/Utility/OtherUtility.tsx`:
    - Input: `string[]`
    - Output: string dạng `"a, b, c"` hoặc `null`.

### 6.4. Edit mode
- `handleEdit()`:
  - `form.setValues({ ...profile, dob: ..., chronicDiseases: profile.chronicDiseases ?? [], allergies: profile.allergies ?? [] })`
- Các component input:
  - `DateInput` nhận `Date`.
  - `TagsInput` nhận `string[]`.

### 6.5. Submit (PUT) và stringify
Trước khi gọi update:

```ts
updatePatient({
  ...profile,
  ...values,
  dob: formatLocalDate(values.dob),
  allergies: values.allergies ? JSON.stringify(values.allergies) : null,
  chronicDiseases: values.chronicDiseases ? JSON.stringify(values.chronicDiseases) : null,
})
```

Lý do stringify:
- Backend đang nhận 2 trường này dạng string JSON.
- Nếu gửi thẳng array, backend có thể fail mapping (tuỳ framework).

Output:
- Success → toast + setProfile.
- Error → toast.

### 6.6. Ví dụ payload Patient (liên quan JSON string)

#### 6.6.1. GET Patient profile
Response (ví dụ dạng, tuỳ backend):
```json
{
  "id": 77,
  "dob": "2000-01-15",
  "phone": "0912345678",
  "address": "Da Nang",
  "citizenId": "012345678901",
  "bloodGroup": "A_POSITIVE",
  "allergies": "[\"Peanut\",\"Dust\"]",
  "chronicDiseases": "[\"Diabetes\"]"
}
```

Frontend chuyển đổi ngay sau fetch:
- `allergies`: JSON string → `string[]` để đổ vào `TagsInput`.
- `chronicDiseases`: JSON string → `string[]`.

#### 6.6.2. PUT Patient profile update
Request body (ví dụ):
```json
{
  "id": 77,
  "dob": "2000-01-15",
  "phone": "0912345678",
  "address": "Da Nang",
  "citizenId": "012345678901",
  "bloodGroup": "A_POSITIVE",
  "allergies": "[\"Peanut\",\"Dust\"]",
  "chronicDiseases": "[\"Diabetes\"]"
}
```

Ghi chú kiểu dữ liệu:
- UI là `string[]`, nhưng backend đang nhận `string` (JSON). Vì vậy phải `JSON.stringify` trước khi submit.

---

## 7) Chi tiết từng module/hàm (Input/Output/đường đi)

### 7.1. `axiosInstance` – `src/Interceptor/AxiosInterceptor.tsx`
- Input: axios request config.
- Transform:
  - Đọc `localStorage.getItem('token')`.
  - Nếu có → set `config.headers.Authorization`.
- Output: config đã được gắn header.

Kết nối:
- `UserService.tsx`, `DoctorProfileService.tsx`, `PatientProfileService.tsx` đều import `axiosInstance`.

### 7.2. DoctorProfileService – `src/Service/DoctorProfileService.tsx`
- `getDoctor(id)`
  - Input: `id`.
  - Output: Promise resolve profile object.
  - Connect: được gọi từ `Doctor/Profile/Profile.tsx` trong `useEffect`.

- `updateDoctor(doctor)`
  - Input: payload doctor.
  - Output: Promise resolve response data.
  - Connect: được gọi từ `Doctor/Profile/Profile.tsx` khi click `Save`.

### 7.3. PatientProfileService – `src/Service/PatientProfileService.tsx`
- `getPatient(id)`
  - Connect: `Patient/Profile/Profile.tsx` trong `useEffect`.
- `updatePatient(patient)`
  - Connect: `Patient/Profile/Profile.tsx` khi click `Save`.

### 7.4. DateUtility – `src/Utility/DateUtility.tsx`
- `formatDate(dateString)`
  - Dùng để hiển thị trong table (view mode).
- `formatLocalDate(dateValue)`
  - Dùng trước khi submit (PUT) để backend nhận date-only.

### 7.5. DropdownData – `src/Data/DropdownData.tsx`
- `bloodGroups`: mảng `{ value, label }` phục vụ `<Select>`.
- `bloodGroupMap`: map value → label, phục vụ hiển thị.
- `doctorSpecializations`, `doctorDepartments`: list string cho `<Select>`.

### 7.6. NotificationUtil – `src/Utility/NotificationUtil.tsx`
- `successNotification(message)`
- `errorNotification(message)`

Connect:
- Được gọi trong profile components và login/register để thông báo UX.

---

## 8) Gợi ý cải thiện (tuỳ chọn)

Không bắt buộc, nhưng nếu muốn code sạch/ổn định hơn:
- Thay `any` bằng type/interface (`DoctorProfile`, `PatientProfile`, `JwtUser`) để tránh sai key/kiểu.
- `Patient/Profile/Profile.tsx`: thêm check `if (!patient.profileId) return;` giống doctor.
- Bọc `JSON.parse` trong `try/catch` để tránh crash nếu backend trả dữ liệu lỗi.
- Bỏ `console.log` trong `handleSubmit` khi lên production.
- Thêm newline cuối file cho các file mới để tránh warning (prettier/lint).

---

## 9) Tóm tắt “dữ liệu được transfer” và loại input/output

### 9.1. GET profile
- Input:
  - `profileId` (lấy từ `state.user.profileId`).
  - Header: `Authorization: Bearer <token>` (tự gắn bởi interceptor).
- Output:
  - `profile` object (backend trả về), set vào React state `profile`.

### 9.2. PUT profile
- Input:
  - Payload object merge từ `profile` hiện tại + values từ form.
  - `dob` chuẩn hoá `YYYY-MM-DD`.
  - Với patient: `allergies/chronicDiseases` stringify JSON.
- Output:
  - Toast success/error.
  - Local state cập nhật để UI phản ánh dữ liệu mới.

---

## 10) Giải thích CHI TIẾT chuyển đổi dữ liệu FE ↔ BE (kèm mock data từng bước)

Phần này tập trung vào các điểm “convert type” quan trọng:
- `dob`: Backend thường là `string` (date-only), nhưng UI `DateInput` cần `Date`.
- `allergies`/`chronicDiseases` (Patient): Backend đang là `string` JSON, nhưng UI `TagsInput` cần `string[]`.
- Form dùng `useForm({ mode: 'uncontrolled' })`: dữ liệu không “chảy” qua React state mỗi lần gõ, nên cần `getValues()` khi submit.

### 10.1. Doctor Profile – mô phỏng từng bước (GET → Edit → PUT)

#### Bước 0: Điều kiện để flow chạy
- Sau login, Redux `state.user` (từ JWT decode) phải có `profileId`.
- Khi `doctor.profileId` thay đổi, `useEffect` trong `Doctor/Profile/Profile.tsx` chạy.

Mock `doctor` trong Redux (ví dụ):
```json
{
  "id": 1,
  "name": "Dr. A",
  "email": "a@hospital.com",
  "role": "DOCTOR",
  "profileId": 123
}
```

#### Bước 1: Frontend gọi GET profile
Tại `useEffect`:
```ts
getDoctor(doctor.profileId).then((data) => {
  setProfile({ ...data });
})
```

Mock request:
- `GET http://localhost:9000/profile/doctor/get/123`
- Headers tự gắn bởi interceptor:
  - `Authorization: Bearer <token>`

Mock response `data` từ backend (ví dụ):
```json
{
  "id": 123,
  "dob": "1995-06-20",
  "phone": "0987654321",
  "address": "HCM",
  "licenseNo": "123456789012",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "totalExp": 5
}
```

Sau bước này:
- `profile` (React state) sẽ là **object đúng y hệt** backend trả về (chưa convert dob sang Date).
- UI ở view mode hiển thị:
  - `formatDate(profile.dob)` để hiển thị `dob` đẹp hơn.

#### Bước 2: Vì sao view mode dùng `formatDate(profile.dob)`?
`profile.dob` đang là string `"1995-06-20"`.
- Nếu render trực tiếp sẽ khó đọc.
- `formatDate` convert sang dạng người dùng: `20 June 1995`.

Không thay đổi dữ liệu gốc backend trong state ở bước này (chỉ format để display).

#### Bước 3: Bấm Edit → `handleEdit()` làm gì và vì sao?
Code:
```ts
form.setValues({ ...profile, dob: profile.dob ? new Date(profile.dob) : undefined });
setEditMode(true);
```

Tại sao phải `form.setValues(...)`?
- Mục tiêu: đổ dữ liệu hiện tại (state `profile`) vào form để user sửa.
- Nếu không set, form sẽ vẫn là `initialValues` (rỗng), user sẽ không thấy dữ liệu cũ.

Tại sao convert `dob` sang `new Date(profile.dob)`?
- Mantine `DateInput` cần `value` kiểu `Date` (hoặc `null/undefined`).
- Backend trả `string` → phải convert sang `Date` để DateInput hiển thị đúng ngày.

Mock trước/sau `handleEdit`:
- Trước:
  - `profile.dob = "1995-06-20"` (string)
  - Form nội bộ chưa có giá trị, hoặc vẫn là `""` theo `initialValues`.
- Sau:
  - Form values:
    - `dob = new Date("1995-06-20")` (Date)
    - `phone = "0987654321"`
    - `totalExp = 5`

#### Bước 4: Người dùng sửa input → dữ liệu nằm ở đâu?
Vì form dùng `mode: 'uncontrolled'`:
- Khi gõ/sửa, Mantine input giữ giá trị ở DOM input.
- `form.getValues()` sẽ “pull” toàn bộ giá trị từ các input ra một object.

Lý do chọn uncontrolled trong code hiện tại:
- Giảm re-render liên tục khi user gõ.
- Không cần tự viết `value/onChange` cho từng trường.

#### Bước 5: Bấm Save → `handleSubmit()` lấy dữ liệu như thế nào?
Code:
```ts
let values = form.getValues();
form.validate();
if (!form.isValid()) return;
updateDoctor({ ...profile, ...values, dob: formatLocalDate(values.dob) })
```

Giải thích từng dòng:
- `values = form.getValues()`:
  - Pull dữ liệu user đang sửa từ form.
- `form.validate()`:
  - Chạy các rule (regex phone, licenseNo, required, range totalExp...).
- `if (!form.isValid()) return;`:
  - Nếu có lỗi, dừng submit (không gọi API).

Tại sao payload là `{ ...profile, ...values, dob: ... }`?
- `profile` chứa các field backend trả về (có thể có `id` hoặc field khác không có input).
- `values` là các field user vừa sửa.
- Merge theo thứ tự này để:
  - Giữ lại các field không hiển thị trên form (vd: `id`).
  - Field nào user sửa sẽ override lên.

Tại sao phải `dob: formatLocalDate(values.dob)`?
- Trong form, `values.dob` đang là `Date` (do DateInput).
- Backend thường muốn **string date-only** (vd `YYYY-MM-DD`).
- `formatLocalDate` trả về `"1995-06-20"`.

Mock `values` khi user sửa:
```json
{
  "dob": "(Date object: 1995-06-21)",
  "phone": "0987000000",
  "address": "Hanoi",
  "licenseNo": "123456789012",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "totalExp": 6
}
```

Mock payload gửi đi (sau convert dob):
```json
{
  "id": 123,
  "dob": "1995-06-21",
  "phone": "0987000000",
  "address": "Hanoi",
  "licenseNo": "123456789012",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "totalExp": 6
}
```

#### Bước 6: Backend trả response → UI cập nhật thế nào?
Trong code doctor hiện tại:
```ts
successNotification(...);
setProfile({ ...profile, ...values });
setEditMode(false);
```

Ý nghĩa:
- `setProfile({ ...profile, ...values })` cập nhật UI ngay theo dữ liệu vừa submit.
- Lưu ý: `values.dob` là `Date` (từ form), nên sau khi save, `profile.dob` có thể trở thành `Date` thay vì string.
  - Nhưng `formatDate(profile.dob)` vẫn chạy được vì `new Date(dateValue)` nhận Date cũng ok.
  - Nếu muốn “chuẩn hoá” state để giống backend (luôn string), có thể set `dob` về string khi setProfile. (Tuỳ bạn muốn state theo BE hay theo UI.)

### 10.2. Patient Profile – mô phỏng từng bước (GET → Parse JSON → Edit → PUT stringify)

Điểm khác lớn nhất của Patient:
- `allergies` và `chronicDiseases` backend trả về dạng **JSON string**.
- Frontend cần convert sang `string[]` để dùng `TagsInput`.

#### Bước 1: GET Patient profile
Mock response backend (ví dụ):
```json
{
  "id": 77,
  "name": "Nguyen B",
  "email": "b@gmail.com",
  "dob": "2000-01-15",
  "phone": "0912345678",
  "address": "Da Nang",
  "citizenId": "012345678901",
  "bloodGroup": "A_POSITIVE",
  "allergies": "[\"Peanut\",\"Dust\"]",
  "chronicDiseases": "[\"Diabetes\"]"
}
```

#### Bước 2: Ngay sau fetch, frontend parse JSON string → array
Code hiện tại:
```ts
setProfile({
  ...data,
  allergies: data.allergies ? JSON.parse(data.allergies) : null,
  chronicDiseases: data.chronicDiseases ? JSON.parse(data.chronicDiseases) : null
});
```

Trước parse:
- `data.allergies = "[\"Peanut\",\"Dust\"]"` (string)

Sau parse:
- `profile.allergies = ["Peanut", "Dust"]` (string[])

Tại sao phải parse ở đây (ngay khi setProfile)?
- View mode cần `arrayToCSV(profile.allergies)`.
- Edit mode cần đổ vào `TagsInput` (TagsInput không làm việc với string JSON).
- Nếu không parse sớm, bạn sẽ phải parse ở nhiều nơi (render + submit), dễ lỗi và khó maintain.

#### Bước 3: Bấm Edit → `handleEdit()` của Patient
Code:
```ts
form.setValues({
  ...profile,
  dob: profile.dob ? new Date(profile.dob) : undefined,
  chronicDiseases: profile.chronicDiseases ?? [],
  allergies: profile.allergies ?? []
});
setEditMode(true);
```

Tại sao `?? []`?
- `TagsInput` mong muốn một mảng.
- Nếu backend trả `null`/empty, bạn vẫn muốn form là `[]` để user nhập.

Mock sau handleEdit:
```json
{
  "dob": "(Date object)",
  "allergies": ["Peanut", "Dust"],
  "chronicDiseases": ["Diabetes"],
  "bloodGroup": "A_POSITIVE"
}
```

#### Bước 4: Submit Patient → stringify array về JSON string
Code chính:
```ts
updatePatient({
  ...profile,
  ...values,
  dob: formatLocalDate(values.dob),
  allergies: values.allergies ? JSON.stringify(values.allergies) : null,
  chronicDiseases: values.chronicDiseases ? JSON.stringify(values.chronicDiseases) : null
})
```

Tại sao phải stringify trước khi gọi API?
- Backend đang nhận 2 field này dạng `string`.
- Nếu gửi thẳng array, backend có thể không map được (tuỳ backend), hoặc lưu sai schema.

Mock `values` (trong form) khi user sửa:
```json
{
  "dob": "(Date object: 2000-01-16)",
  "bloodGroup": "O_NEGATIVE",
  "allergies": ["Peanut"],
  "chronicDiseases": ["Diabetes", "Hypertension"]
}
```

Mock payload gửi backend (sau convert):
```json
{
  "id": 77,
  "dob": "2000-01-16",
  "bloodGroup": "O_NEGATIVE",
  "allergies": "[\"Peanut\"]",
  "chronicDiseases": "[\"Diabetes\",\"Hypertension\"]"
}
```

#### Bước 5: View mode hiển thị blood group và arrays
- `bloodGroupMap[profile.bloodGroup]`:
  - vì backend lưu enum key (vd `A_POSITIVE`) nhưng UI cần label (vd `A+`).
- `arrayToCSV(profile.allergies)`:
  - vì `profile.allergies` đã được parse thành `string[]`, nên join ra chuỗi.

### 10.3. Bảng đối chiếu kiểu dữ liệu (rất hay nhầm)

#### Doctor
| Field | Backend trả về | View mode dùng | Edit form dùng | Payload PUT gửi |
|---|---|---|---|---|
| `dob` | `string` (`YYYY-MM-DD`) | `formatDate(string|Date)` | `Date` (DateInput) | `string` (`YYYY-MM-DD`) |
| `phone` | `string` | render string | NumberInput (thường vẫn coi như string/number) | `string/number` tuỳ input |
| `totalExp` | `number` | render number | NumberInput (number) | `number` |

#### Patient
| Field | Backend trả về | View mode dùng | Edit form dùng | Payload PUT gửi |
|---|---|---|---|---|
| `allergies` | `string` JSON | parse → `string[]` rồi `arrayToCSV` | `string[]` (TagsInput) | `string` JSON |
| `chronicDiseases` | `string` JSON | parse → `string[]` | `string[]` | `string` JSON |
| `bloodGroup` | enum key `A_POSITIVE` | map sang `A+` | Select value là enum key | enum key |

### 10.4. Vì sao validate lại viết kiểu regex/required như hiện tại?
- `phone`: `/^\d{10}$/`
  - đảm bảo đủ 10 chữ số, tránh ký tự lạ.
- `citizenId`/`licenseNo`: `/^\d{12}$/`
  - đảm bảo đúng độ dài theo constraint bạn đặt.
- `totalExp`: kiểm tra 0–60
  - tránh số âm hoặc quá lớn.

Lưu ý: Validate hiện tại phản ánh “business rule” của bạn. Nếu backend rule khác, nên sync lại để tránh FE pass nhưng BE reject (hoặc ngược lại).

---

Nếu bạn muốn, mình có thể:
- Đề xuất model type chuẩn cho Doctor/Patient profile.
- Hoặc giúp bạn chọn commit scope cho 2 file trong `public/` (commit hay ignore).
