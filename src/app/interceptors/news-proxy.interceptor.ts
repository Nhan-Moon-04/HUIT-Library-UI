import { HttpInterceptorFn } from '@angular/common/http';

export const newsProxyInterceptor: HttpInterceptorFn = (req, next) => {
  // Remove authorization header for news proxy requests
  if (req.url.includes('/news-proxy/')) {
    const newReq = req.clone({
      setHeaders: {
        // Keep only content-type, remove authorization
        'Content-Type': 'application/json',
      },
      headers: req.headers.delete('authorization'),
    });

    console.log('News proxy request - removing auth header:', newReq.url);
    return next(newReq);
  }

  return next(req);
};
