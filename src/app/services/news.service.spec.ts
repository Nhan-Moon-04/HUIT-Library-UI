import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsService } from './news.service';

describe('NewsService with Proxy', () => {
  let service: NewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NewsService],
    });
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call news API through proxy', () => {
    const mockResponse = {
      success: true,
      lstNewsPaging: [
        {
          ITEMID: 5259,
          TITLE: 'Test News Title',
          CONTENT: 'Test content',
          PUBLISHDATE: '2025-11-08T00:00:00',
          CREATED: '2025-11-10T15:14:05',
          MODIFIED: '2025-11-12T14:05:58.567',
          VIEWCOUNT: 66,
          AUTHORID: 48,
          STRAUTHOR_NAME: 'Test Author',
          STRCATEGORY_NAME: 'Test Category',
          STRARTICLETYPE_NAME: 'Test Type',
          FRIENDLYNAME: 'test-news',
          ISDISPLAY: true,
          STATUS: 3,
          STRSTATUS: 'Đã ban hành',
          STRUCTUREID: ',284,',
          ARTICLETYPEID: 18,
          ITEMIMG: '',
          TOPITEM: false,
        },
      ],
    };

    service.getNewsList(1, 8).subscribe((response) => {
      expect(response.success).toBeTruthy();
      expect(response.lstNewsPaging.length).toBe(1);
      expect(response.lstNewsPaging[0].TITLE).toBe('Test News Title');
    });

    const req = httpMock.expectOne('/news-proxy/News/GetOverViews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: 1,
      pageSize: 8,
      language: '',
    });

    req.flush(mockResponse);
  });
});
