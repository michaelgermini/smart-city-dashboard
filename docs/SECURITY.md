# 🔒 Guide de Sécurité - Smart City Dashboard Genève

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans le dashboard Smart City de Genève et les bonnes pratiques à suivre.

## 🛡️ Architecture de Sécurité

### Défense en Profondeur

```
Internet ──► Firewall ──► Reverse Proxy ──► Application ──► Base de Données
     │            │             │              │              │
     ├─ DDoS     ├─ Rate       ├─ Authent.    ├─ Validation ├─ Chiffrement
     ├─ WAF      ├─ Limiting   ├─ JWT         ├─ Sanitize   ├─ SSL/TLS
     └─ IPS      └─ CORS       └─ RBAC        └─ XSS        └─ Audit
```

## 🔐 Authentification et Autorisation

### JWT (JSON Web Tokens)

```typescript
// Configuration sécurisée
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'smartcity-geneva.ch',
  audience: 'dashboard.smartcity-geneva.ch'
};

// Génération du token
const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
  },
  jwtConfig.secret,
  {
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  }
);
```

### RBAC (Role-Based Access Control)

```typescript
enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

const rolePermissions = {
  [UserRole.ADMIN]: [
    'read:*',
    'write:*',
    'delete:*',
    'admin:*'
  ],
  [UserRole.OPERATOR]: [
    'read:traffic',
    'read:parking',
    'read:transport',
    'write:alerts'
  ],
  [UserRole.VIEWER]: [
    'read:traffic',
    'read:parking',
    'read:transport'
  ]
};
```

### Middleware d'Autorisation

```typescript
const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: Function) => {
    const user = req.user as User;

    if (!user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Utilisation
app.get('/api/admin/users',
  authenticateToken,
  authorize('admin:users'),
  getUsersHandler
);
```

## 🌐 Sécurité Réseau

### Configuration Nginx Sécurisée

```nginx
# nginx.conf sécurisé
server {
    listen 443 ssl http2;
    server_name dashboard.smartcity-geneva.ch;

    # SSL/TLS Configuration
    ssl_certificate /etc/ssl/certs/smartcity.crt;
    ssl_certificate_key /etc/ssl/private/smartcity.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' wss:;" always;

    # Rate Limiting
    limit_req zone=api burst=10 nodelay;
    limit_req zone=auth burst=5 nodelay;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=3r/s;
```

### Firewall UFW

```bash
# Configuration UFW sécurisée
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Ports essentiels uniquement
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Rate limiting SSH
sudo ufw limit ssh/tcp

# Activer
sudo ufw enable
```

### Fail2Ban

```bash
# Configuration Fail2Ban
sudo apt install fail2ban

# Configuration SSH
cat > /etc/fail2ban/jail.d/ssh.conf << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

# Redémarrage
sudo systemctl restart fail2ban
```

## 🔒 Sécurité Application

### Protection contre les Vulnérabilités Web

#### XSS (Cross-Site Scripting)

```typescript
// Sanitisation des entrées
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Middleware de validation
const validateInput = (req: Request, res: Response, next: Function) => {
  const { title, description } = req.body;

  if (title && title.length > 200) {
    return res.status(400).json({ error: 'Title too long' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description too long' });
  }

  req.body.title = sanitizeInput(title);
  req.body.description = sanitizeInput(description);

  next();
};
```

#### CSRF (Cross-Site Request Forgery)

```typescript
// Génération de token CSRF
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Middleware
app.use(csrfProtection);

// Ajout du token aux réponses
app.use((req: Request, res: Response, next: Function) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Vérification dans les formulaires
app.post('/api/alerts', csrfProtection, createAlertHandler);
```

#### Injection SQL

```typescript
// Utilisation de paramètres préparés
const getTrafficData = async (routeId: string, startDate: Date, endDate: Date) => {
  const query = `
    SELECT * FROM traffic_data
    WHERE route_id = $1
    AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp DESC
  `;

  const values = [routeId, startDate, endDate];
  const result = await pool.query(query, values);

  return result.rows;
};
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de connexion par fenêtre
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  }
});

// Application
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
```

## 🗄️ Sécurité Base de Données

### Chiffrement des Données

```sql
-- Activer le chiffrement SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/postgresql.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/postgresql.key';

-- Chiffrement des données sensibles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction de chiffrement
CREATE OR REPLACE FUNCTION encrypt_data(input_text text, key text)
RETURNS text AS $$
BEGIN
  RETURN encode(encrypt(input_text::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Fonction de déchiffrement
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_text text, key text)
RETURNS text AS $$
BEGIN
  RETURN decrypt(decode(encrypted_text, 'hex'), key::bytea, 'aes')::text;
END;
$$ LANGUAGE plpgsql;
```

### Politiques de Sécurité RLS (Row Level Security)

```sql
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs
CREATE POLICY user_policy ON users
  FOR ALL USING (user_id = current_user_id());

-- Politique pour les alertes basée sur les rôles
CREATE POLICY alert_read_policy ON alerts
  FOR SELECT USING (
    CASE
      WHEN current_user_role = 'admin' THEN true
      WHEN current_user_role = 'operator' THEN severity IN ('medium', 'high', 'critical')
      ELSE false
    END
  );
```

### Audit et Logging

```sql
-- Activer l'audit
CREATE EXTENSION IF NOT EXISTS pg_audit;

-- Configuration de l'audit
ALTER SYSTEM SET pgaudit.log = 'read, write, ddl';
ALTER SYSTEM SET pgaudit.log_catalog = off;
ALTER SYSTEM SET pgaudit.log_parameter = on;

-- Table d'audit personnalisée
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Fonction d'audit
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('app.user_id', true)::integer
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Trigger d'audit
CREATE TRIGGER audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sensitive_table
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## 🔑 Gestion des Secrets

### Variables d'Environnement Sécurisées

```bash
# .env (NE PAS commiter)
DB_PASSWORD=your_super_secure_password_here
JWT_SECRET=your_256_bit_secret_key_here
API_KEYS_ENCRYPTION_KEY=your_encryption_key_here

# Générer des clés sécurisées
openssl rand -hex 32  # Pour JWT_SECRET
openssl rand -hex 16  # Pour les clés de chiffrement
```

### Gestion des Clés API

```typescript
// Service de gestion des clés API
class ApiKeyService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.API_KEYS_ENCRYPTION_KEY;
  }

  async encryptApiKey(apiKey: string): Promise<string> {
    // Chiffrement AES-256
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async decryptApiKey(encryptedKey: string): Promise<string> {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## 📊 Monitoring et Alertes de Sécurité

### Détection d'Intrusion

```bash
# Installation OSSEC
wget -q -O - https://updates.atomicorp.com/installers/atomic | sudo bash
sudo yum install ossec-hids-server

# Configuration OSSEC
sudo /var/ossec/bin/ossec-control start

# Intégration avec l'application
const ossec = require('node-ossec');

const securityMonitor = new ossec.Client({
  host: 'localhost',
  port: 1514,
  key: process.env.OSSEC_KEY
});
```

### Alertes de Sécurité

```typescript
// Service d'alertes de sécurité
class SecurityAlertService {
  async detectSuspiciousActivity(logEntry: LogEntry): Promise<void> {
    // Détection de tentatives de connexion répétées
    if (this.isBruteForceAttempt(logEntry)) {
      await this.alertSecurityTeam('Brute force attempt detected', logEntry);
    }

    // Détection d'accès non autorisés
    if (this.isUnauthorizedAccess(logEntry)) {
      await this.alertSecurityTeam('Unauthorized access attempt', logEntry);
    }

    // Détection d'injection SQL
    if (this.isSQLInjectionAttempt(logEntry)) {
      await this.alertSecurityTeam('SQL injection attempt detected', logEntry);
    }
  }

  private isBruteForceAttempt(logEntry: LogEntry): boolean {
    // Logique de détection de brute force
    return logEntry.failed_attempts > 5 && logEntry.time_window < 300000; // 5 min
  }

  private async alertSecurityTeam(message: string, details: any): Promise<void> {
    // Envoi d'alerte par email/SMS
    await this.sendAlert({
      to: 'michael@germini.info',
      subject: '🚨 Security Alert',
      message: message,
      details: details,
      priority: 'high'
    });
  }
}
```

### Métriques de Sécurité

```typescript
// Métriques Prometheus pour la sécurité
const securityMetrics = {
  failedLoginAttempts: new client.Counter({
    name: 'smartcity_security_failed_login_attempts_total',
    help: 'Total number of failed login attempts'
  }),

  suspiciousRequests: new client.Counter({
    name: 'smartcity_security_suspicious_requests_total',
    help: 'Total number of suspicious requests detected'
  }),

  blockedIPs: new client.Gauge({
    name: 'smartcity_security_blocked_ips',
    help: 'Number of currently blocked IP addresses'
  }),

  activeSessions: new client.Gauge({
    name: 'smartcity_security_active_sessions',
    help: 'Number of active user sessions'
  })
};
```

## 🧪 Tests de Sécurité

### Tests Automatisés

```typescript
// Tests de sécurité avec Jest
describe('Security Tests', () => {
  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: maliciousInput });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid input');
  });

  test('should enforce rate limiting', async () => {
    const requests = Array(15).fill().map(() =>
      request(app).get('/api/traffic/current')
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  test('should validate JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
  });
});
```

### Tests de Pénétration

```bash
# Tests avec OWASP ZAP
docker run -p 8080:8080 -p 8090:8090 \
  -i owasp/zap2docker-stable zap.sh \
  -cmd -autorun /zap/wrk/automation.yml

# Tests avec Nikto
nikto -h https://dashboard.smartcity-geneva.ch

# Tests SSL/TLS
sslscan dashboard.smartcity-geneva.ch
testssl.sh dashboard.smartcity-geneva.ch
```

## 📋 Checklist de Sécurité

### Configuration Initiale
- [ ] Changer tous les mots de passe par défaut
- [ ] Générer des clés JWT sécurisées (256 bits minimum)
- [ ] Configurer SSL/TLS avec certificats valides
- [ ] Activer le firewall et les règles de sécurité
- [ ] Configurer les headers de sécurité HTTP

### Authentification
- [ ] Implémenter une politique de mots de passe forts
- [ ] Configurer le verrouillage de compte après échecs
- [ ] Activer l'authentification multi-facteurs
- [ ] Définir des timeouts de session appropriés
- [ ] Journaliser toutes les tentatives d'authentification

### Autorisation
- [ ] Implémenter le principe du moindre privilège
- [ ] Valider les permissions à chaque requête
- [ ] Sécuriser les endpoints sensibles
- [ ] Implémenter des contrôles d'accès basés sur les rôles

### Données
- [ ] Chiffrer les données sensibles en transit et au repos
- [ ] Implémenter des politiques de rétention des données
- [ ] Sanitiser toutes les entrées utilisateur
- [ ] Valider les données avant traitement

### Infrastructure
- [ ] Maintenir les systèmes à jour
- [ ] Configurer la surveillance continue
- [ ] Implémenter des sauvegardes régulières
- [ ] Préparer un plan de réponse aux incidents

### Conformité
- [ ] Respecter le RGPD pour les données personnelles
- [ ] Implémenter des audits de sécurité réguliers
- [ ] Documenter toutes les mesures de sécurité
- [ ] Former l'équipe aux bonnes pratiques

## 🚨 Plan de Réponse aux Incidents

### Niveaux de Sévérité

| Niveau | Description | Délai de réponse | Escalade |
|--------|-------------|------------------|----------|
| **Critique** | Service indisponible, données compromises | < 15 min | Direction + Autorités |
| **Élevé** | Fonctionnalité dégradée, accès non autorisé | < 1h | Équipe sécurité |
| **Moyen** | Anomalie détectée, impact limité | < 4h | Équipe technique |
| **Faible** | Tentative détectée, bloquée | < 24h | Logging uniquement |

### Procédure d'Intervention

1. **Détection** : Alertes automatiques et monitoring
2. **Évaluation** : Analyse de l'impact et de la sévérité
3. **Containment** : Isolation de la menace
4. **Eradication** : Suppression de la cause racine
5. **Récupération** : Restauration des services
6. **Leçon** : Analyse post-incident et améliorations

### Contacts d'Urgence

- **Équipe Sécurité** : michael@germini.info
- **Équipe Technique** : michael@germini.info
- **Direction** : michael@germini.info
- **Autorités** : Police cantonale | 117

---

*Dernière mise à jour : Janvier 2024*
