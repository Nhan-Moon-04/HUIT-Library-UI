import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NewsItem {
  ITEMID: number;
  TITLE: string;
  CONTENT: string;
  ITEMSHORTCONTENT?: string;
  ITEMIMG: string;
  PUBLISHDATE: string;
  CREATED: string;
  MODIFIED: string;
  VIEWCOUNT: number;
  AUTHORID: number;
  STRAUTHOR_NAME: string;
  STRCATEGORY_NAME?: string;
  STRARTICLETYPE_NAME: string;
  FRIENDLYNAME: string;
  ISDISPLAY: boolean;
  STATUS: number;
  STRSTATUS: string;
  STRUCTUREID: string;
  CATEGORYID?: number;
  ARTICLETYPEID: number;
  TAG?: string;
  TOPITEM: boolean;
}

export interface NewsResponse {
  success: boolean;
  lstNewsPaging: NewsItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.appUrl}`; // Localhost cho các API khác
  private newsApiUrl = '/news-proxy'; // Sử dụng proxy cho API tin tức
  private customerId = 'HUFI'; // Customer ID for HUIT

  /**
   * Lấy danh sách tin tức với phân trang
   */
  getNewsList(pageNumber: number = 1, pageSize: number = 10): Observable<NewsResponse> {
    // Gọi API tin tức thực tế - sử dụng GetOverViews endpoint
    const headers = {
      'Content-Type': 'application/json',
    };

    const body = {
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: pageNumber,
      pageSize: pageSize,
      language: '',
    };

    console.log('GetOverViews payload:', body);
    console.log('Calling URL:', `${this.newsApiUrl}/News/GetOverViews`);
    return this.http
      .post<NewsResponse>(`${this.newsApiUrl}/News/GetOverViews`, body, { headers })
      .pipe(
        catchError((error) => {
          console.error('News API error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
          });
          // Return demo data as fallback
          return this.getDemoNewsData();
        })
      );
  }

  /**
   * Lấy tin tức nổi bật
   */
  getFeaturedNews(limit: number = 5): Observable<NewsResponse> {
    const headers = {
      'Content-Type': 'application/json',
    };

    const body = {
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: 1,
      pageSize: limit,
      language: '',
    };

    console.log('GetFeaturedNews payload:', body);
    console.log('Calling URL:', `${this.newsApiUrl}/News/GetOverViews`);
    return this.http
      .post<NewsResponse>(`${this.newsApiUrl}/News/GetOverViews`, body, { headers })
      .pipe(
        catchError((error) => {
          console.error('Featured News API error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
          });
          // Return demo data as fallback
          return this.getDemoNewsData();
        })
      );
  }

  /**
   * Lấy chi tiết tin tức theo ID
   */
  getNewsDetail(
    itemId: number
  ): Observable<{ success: boolean; data: NewsItem; message?: string }> {
    return this.http.get<{ success: boolean; data: NewsItem; message?: string }>(
      `${this.newsApiUrl}/News/GetNewsDetail`,
      {
        params: {
          itemId: itemId.toString(),
          customerId: this.customerId,
        },
      }
    );
  }

  /**
   * Tăng lượt xem tin tức
   */
  increaseViewCount(itemId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.newsApiUrl}/News/IncreaseViewCount`,
      {
        itemId: itemId,
        customerId: this.customerId,
      }
    );
  }

  /**
   * Lấy URL ảnh từ news item hoặc DisplayImage API
   */
  getImageUrl(newsItem: NewsItem): string {
    // Nếu có ITEMIMG base64, sử dụng trực tiếp
    if (newsItem.ITEMIMG && newsItem.ITEMIMG.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${newsItem.ITEMIMG}`;
    }

    // Nếu có ITEMID, sử dụng proxy cho DisplayImage API
    if (newsItem.ITEMID) {
      const timestamp = Date.now();
      return `${this.newsApiUrl}/News/DisplayImage/?customerId=${this.customerId}&itemID=${newsItem.ITEMID}&t=${timestamp}`;
    }

    // Fallback placeholder
    return 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Tin+tức+HUIT';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  /**
   * Get excerpt from content
   */
  getExcerpt(content: string, maxLength: number = 150): string {
    if (!content) return '';

    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');

    if (textContent.length <= maxLength) {
      return textContent;
    }

    return textContent.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get category display name
   */
  getCategoryName(newsItem: NewsItem): string {
    return newsItem.STRCATEGORY_NAME || newsItem.STRARTICLETYPE_NAME || 'Tin tức';
  }

  /**
   * Check if news item is hot/featured
   */
  isHotNews(newsItem: NewsItem): boolean {
    return newsItem.TOPITEM || false;
  }

  /**
   * Get author name
   */
  getAuthorName(newsItem: NewsItem): string {
    return newsItem.STRAUTHOR_NAME || 'Ban biên tập';
  }

  /**
   * Get demo news data as fallback
   */
  private getDemoNewsData(): Observable<NewsResponse> {
    const demoNews: NewsItem[] = [
      {
        ITEMID: 5259,
        TITLE:
          'Thư viện Trường Đại học Công Thương TP. HCM tiếp nhận hơn 1.000 quyển sách ngoại văn từ GS. Trần Hữu Dũng và Chương trình Books4VN của TS. Võ Tá Hân',
        CONTENT:
          'Sáng ngày 08/11/2025, tại Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT) đã diễn ra Lễ tiếp nhận 1.191 quyển sách ngoại văn do GS. Trần Hữu Dũng, nguyên giảng viên Đại học Wright State (Hoa Kỳ), một học giả uy tín và có nhiều cống hiến trong lĩnh vực kinh tế học, và Chương trình Books4VN của TS. Võ Tá Hân trao tặng.',
        ITEMSHORTCONTENT: '',
        ITEMIMG: '',
        PUBLISHDATE: '2025-11-08T00:00:00',
        CREATED: '2025-11-10T15:14:05',
        MODIFIED: '2025-11-12T14:05:58.567',
        VIEWCOUNT: 48,
        AUTHORID: 48,
        STRAUTHOR_NAME: 'Nguyễn Thị Thúy Hà',
        STRCATEGORY_NAME: 'Tin tức',
        STRARTICLETYPE_NAME: 'Sự kiện',
        FRIENDLYNAME:
          'thu-vien-truong-dai-hoc-cong-thuong-tp-hcm-tiep-nhan-hon-1-000-quyen-sach-ngoai-van-tu-gs-tran-huu-dung-va-chuong-trinh-books4vn-cua-ts-vo-ta-han',
        ISDISPLAY: true,
        STATUS: 3,
        STRSTATUS: 'Đã ban hành',
        STRUCTUREID: ',284,',
        CATEGORYID: undefined,
        ARTICLETYPEID: 18,
        TAG: '',
        TOPITEM: true,
      },
      {
        ITEMID: 5255,
        TITLE: 'Ngày sách và Văn hoá đọc Việt Nam năm 2025',
        CONTENT:
          'Nhằm phát triển văn hóa đọc trong cộng đồng, thư viện tổ chức các hoạt động kỷ niệm ngày sách Việt Nam.',
        ITEMSHORTCONTENT: '',
        ITEMIMG: '',
        PUBLISHDATE: '2025-10-21T00:00:00',
        CREATED: '2025-10-21T10:30:00',
        MODIFIED: '2025-10-21T14:20:00',
        VIEWCOUNT: 125,
        AUTHORID: 48,
        STRAUTHOR_NAME: 'Ban thư viện',
        STRCATEGORY_NAME: 'Văn hóa đọc',
        STRARTICLETYPE_NAME: 'Hoạt động',
        FRIENDLYNAME: 'ngay-sach-va-van-hoa-doc-viet-nam-nam-2025',
        ISDISPLAY: true,
        STATUS: 3,
        STRSTATUS: 'Đã ban hành',
        STRUCTUREID: ',284,',
        CATEGORYID: undefined,
        ARTICLETYPEID: 18,
        TAG: 'sách, văn hóa đọc',
        TOPITEM: false,
      },
      {
        ITEMID: 5250,
        TITLE: 'Hội thảo khoa học "Xu hướng phát triển thư viện số trong thời đại 4.0"',
        CONTENT:
          'Thư viện HUIT tổ chức hội thảo về xu hướng phát triển thư viện số, ứng dụng công nghệ mới.',
        ITEMSHORTCONTENT: '',
        ITEMIMG: '',
        PUBLISHDATE: '2025-10-15T00:00:00',
        CREATED: '2025-10-15T09:00:00',
        MODIFIED: '2025-10-15T16:45:00',
        VIEWCOUNT: 89,
        AUTHORID: 48,
        STRAUTHOR_NAME: 'Ban khoa học',
        STRCATEGORY_NAME: 'Hội thảo',
        STRARTICLETYPE_NAME: 'Khoa học',
        FRIENDLYNAME: 'hoi-thao-khoa-hoc-xu-huong-phat-trien-thu-vien-so-trong-thoi-dai-4-0',
        ISDISPLAY: true,
        STATUS: 3,
        STRSTATUS: 'Đã ban hành',
        STRUCTUREID: ',284,',
        CATEGORYID: undefined,
        ARTICLETYPEID: 18,
        TAG: 'thư viện số, công nghệ',
        TOPITEM: false,
      },
    ];

    return of({
      success: true,
      lstNewsPaging: demoNews,
      message: 'Demo data loaded as fallback',
    });
  }
}
