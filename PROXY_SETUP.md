# Cấu hình Proxy cho API Tin tức

## Tổng quan

Để tránh lỗi CORS khi gọi API tin tức từ `https://thuvien.huit.edu.vn`, chúng ta đã cấu hình proxy cho Angular development server.

## Cấu hình Proxy

### 1. File proxy.conf.json

```json
{
  "/news-proxy/*": {
    "target": "https://thuvien.huit.edu.vn",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/news-proxy": ""
    },
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### 2. Cấu hình angular.json

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  },
  // ... rest of config
}
```

### 3. Package.json scripts

```json
"scripts": {
  "start": "ng serve --proxy-config proxy.conf.json",
  "start-no-proxy": "ng serve"
}
```

## Cách hoạt động

1. **Trước proxy**: `http://localhost:4200` → `https://thuvien.huit.edu.vn/News/GetOverViews` ❌ CORS Error

2. **Với proxy**: `http://localhost:4200/news-proxy/News/GetOverViews` → Angular Dev Server → `https://thuvien.huit.edu.vn/News/GetOverViews` ✅

## API Endpoints được proxy

### GetOverViews - Lấy danh sách tin tức

- **Frontend URL**: `http://localhost:4200/news-proxy/News/GetOverViews`
- **Backend URL**: `https://thuvien.huit.edu.vn/News/GetOverViews`
- **Method**: POST
- **Body**:

```json
{
  "friendlyName": "tin-tuc-su-kien",
  "pageIndex": 1,
  "pageSize": 8,
  "language": ""
}
```

### DisplayImage - Lấy hình ảnh tin tức

- **Frontend URL**: `http://localhost:4200/news-proxy/News/DisplayImage/?customerId=HUFI&itemID=5259`
- **Backend URL**: `https://thuvien.huit.edu.vn/News/DisplayImage/?customerId=HUFI&itemID=5259`
- **Method**: GET

## Sử dụng trong NewsService

```typescript
export class NewsService {
  private newsApiUrl = '/news-proxy'; // Sử dụng proxy

  getNewsList(pageNumber: number = 1, pageSize: number = 10): Observable<NewsResponse> {
    const body = {
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: pageNumber,
      pageSize: pageSize,
      language: '',
    };

    return this.http.post<NewsResponse>(`${this.newsApiUrl}/News/GetOverViews`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

## Khởi chạy với proxy

```bash
# Khởi chạy với proxy (mặc định)
npm start

# Hoặc khởi chạy không proxy
npm run start-no-proxy
```

## Debug proxy

Để debug proxy, kiểm tra:

1. **Browser Network Tab**: Xem requests đến `/news-proxy/*`
2. **Console logs**: Angular dev server sẽ log proxy requests
3. **Proxy logs**: Set `"logLevel": "debug"` trong proxy.conf.json

## Lưu ý quan trọng

1. **Chỉ hoạt động trong development**: Proxy chỉ hoạt động với `ng serve`, không hoạt động trong production build.

2. **Production deployment**: Cần cấu hình reverse proxy trên web server (nginx, apache) cho production.

3. **CORS headers**: Proxy giúp bỏ qua CORS bằng cách server Angular development làm intermediary.

4. **Performance**: Proxy có thể làm chậm requests do phải đi qua Angular dev server.

## Troubleshooting

### Lỗi thường gặp:

1. **Proxy không hoạt động**:

   - Kiểm tra proxy.conf.json syntax
   - Restart `ng serve`
   - Kiểm tra angular.json có `proxyConfig` đúng không

2. **API trả về 404**:

   - Kiểm tra `pathRewrite` mapping
   - Kiểm tra target URL

3. **CORS vẫn xảy ra**:
   - Kiểm tra `changeOrigin: true`
   - Kiểm tra headers configuration
