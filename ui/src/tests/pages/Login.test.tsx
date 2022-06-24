import {createRoot, Root} from 'react-dom/client';
import {act} from 'react-dom/test-utils';
import {MemoryRouter} from 'react-router-dom';

import {Login} from '../../pages/Login';

let container: Element | null = null;
let root: Root | null = null;

jest.mock('../../globals/constants', () => ({
  REDIRECT_URL: 'redirect-uri',
  GOOGLE_CLIENT_ID: 'google-client-id',
}));

jest.mock('../../assets', () => ({
  logo: 'dummy-logo',
  loginArrow: 'dummy-arrow',
}));

describe('<Login />', () => {
  const {location} = window;

  beforeAll(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    delete (window as any).location;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    window.location = {assign: jest.fn()} as any;
  });

  beforeEach(() => {
    act(() => {
      root = createRoot(container!);
    });
  });

  it('should redirect to google oauth2 page on login click', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
    });

    const loginButton = document.querySelector('[data-testid=signin]');
    expect(loginButton!.textContent!.trim()).toBe('SIGN IN');

    act(() => {
      loginButton!.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    const queryParams = new URLSearchParams({
      scope:
        'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      include_granted_scopes: 'true',
      response_type: 'token',
      state: 'state_parameter_passthrough_value',
      redirect_uri: 'redirect-uri',
      client_id: 'google-client-id',
    });

    const googleOAuth2PageUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?' + queryParams.toString();

    expect(window.location.assign).toBeCalledTimes(1);
    expect(window.location.assign).toBeCalledWith(googleOAuth2PageUrl);
  });

  afterEach(() => {
    act(() => {
      root!.unmount();
    });
  });

  afterAll(() => {
    document.body.removeChild(container!);
    window.location = location;
  });
});
