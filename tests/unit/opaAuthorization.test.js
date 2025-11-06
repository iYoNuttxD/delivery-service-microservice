const opaAuthorization = require('../../src/middlewares/opaAuthorization');
const authPolicyClient = require('../../src/infra/opa/authPolicyClient');

jest.mock('../../src/infra/opa/authPolicyClient');

describe('opaAuthorization middleware', () => {
  let req, res, next;
  let originalOpaUrl;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Save original env
    originalOpaUrl = process.env.OPA_URL;
    
    req = {
      headers: {
        'x-user-id': 'user123'
      },
      path: '/test',
      method: 'POST'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  afterEach(() => {
    // Restore original env
    if (originalOpaUrl) {
      process.env.OPA_URL = originalOpaUrl;
    } else {
      delete process.env.OPA_URL;
    }
  });

  it('should allow request when policy allows', async () => {
    process.env.OPA_URL = 'http://localhost:8181';
    authPolicyClient.canPerformAction.mockResolvedValue(true);

    const middleware = opaAuthorization();
    await middleware(req, res, next);

    expect(authPolicyClient.canPerformAction).toHaveBeenCalledWith(
      'user123',
      'delivery',
      'write'
    );
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny request when policy denies', async () => {
    process.env.OPA_URL = 'http://localhost:8181';
    authPolicyClient.canPerformAction.mockResolvedValue(false);

    const middleware = opaAuthorization();
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Você não tem permissão para executar esta ação'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated', async () => {
    process.env.OPA_URL = 'http://localhost:8181';
    req.headers['x-user-id'] = 'anonymous';

    const middleware = opaAuthorization();
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Usuário não autenticado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should bypass authorization when OPA_URL is not set', async () => {
    delete process.env.OPA_URL;

    const middleware = opaAuthorization();
    await middleware(req, res, next);

    expect(authPolicyClient.canPerformAction).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should use custom resource and action', async () => {
    process.env.OPA_URL = 'http://localhost:8181';
    authPolicyClient.canPerformAction.mockResolvedValue(true);

    const middleware = opaAuthorization({
      resource: 'tracking',
      action: 'update'
    });
    await middleware(req, res, next);

    expect(authPolicyClient.canPerformAction).toHaveBeenCalledWith(
      'user123',
      'tracking',
      'update'
    );
  });

  it('should handle errors gracefully', async () => {
    process.env.OPA_URL = 'http://localhost:8181';
    authPolicyClient.canPerformAction.mockRejectedValue(
      new Error('OPA error')
    );

    const middleware = opaAuthorization();
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Erro ao verificar permissões'
    });
  });
});
