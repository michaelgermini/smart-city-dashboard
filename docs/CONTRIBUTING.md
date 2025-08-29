# 🤝 Guide de Contribution - Smart City Dashboard Genève

Bienvenue dans le projet Smart City Dashboard ! Ce guide explique comment contribuer efficacement au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Workflow de Développement](#workflow-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## 📜 Code de Conduite

### Nos Engagements

Nous nous engageons à créer un environnement ouvert et accueillant pour tous, indépendamment de :
- L'âge, la taille corporelle, le handicap visible ou invisible
- L'appartenance ethnique, les caractéristiques sexuelles, l'identité et l'expression de genre
- Le niveau d'expérience, l'éducation, le statut socio-économique
- La nationalité, l'apparence personnelle, la race ou la religion

### Nos Standards

Exemples de comportements qui contribuent à créer un environnement positif :
- ✅ Utiliser un langage accueillant et inclusif
- ✅ Respecter les points de vue et expériences différents
- ✅ Accepter gracieusement les critiques constructives
- ✅ Se concentrer sur ce qui est meilleur pour la communauté
- ✅ Montrer de l'empathie envers les autres membres

### Signalement

Les incidents peuvent être signalés en contactant : michael@germini.info

## 🚀 Comment Contribuer

### Types de Contributions

1. **🐛 Corrections de bugs** : Signaler ou corriger des bugs
2. **✨ Nouvelles fonctionnalités** : Développer de nouvelles fonctionnalités
3. **📚 Documentation** : Améliorer la documentation
4. **🧪 Tests** : Ajouter ou améliorer les tests
5. **🎨 Interface utilisateur** : Améliorer l'UX/UI
6. **🔧 Outils** : Améliorer les outils de développement

### Premiers Pas

1. **Fork** le projet
2. **Clone** votre fork : `git clone https://github.com/YOUR-USERNAME/smart-city-dashboard.git`
3. **Configure** votre environnement local
4. **Créez** une branche pour votre contribution
5. **Développez** votre contribution
6. **Testez** vos changements
7. **Soumettez** une pull request

## 🛠️ Configuration de l'Environnement

### Prérequis

```bash
# Vérifier les versions
node --version    # >= 18.0.0
npm --version     # >= 8.0.0
docker --version  # >= 20.10.0
```

### Installation Rapide

```bash
# Cloner le projet
git clone https://github.com/smartcity-geneva/dashboard.git
cd smart-city-dashboard

# Installer les dépendances
npm run setup

# Configurer l'environnement
cp env.example .env

# Démarrer en mode développement
npm run dev
```

### Configuration Détaillée

#### Backend

```bash
cd backend
npm install

# Variables d'environnement nécessaires
cp .env.example .env
nano .env

# Démarrer en mode développement
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Variables d'environnement
cp .env.example .env
nano .env

# Démarrer en mode développement
npm start
```

#### Base de Données

```bash
# Avec Docker (recommandé)
docker-compose up -d timescaledb

# Ou installation locale PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive --pwprompt smartcity
sudo -u postgres createdb -O smartcity smart_city
```

## 🔄 Workflow de Développement

### Branches

```
main                    # Branche de production
├── develop            # Branche de développement
│   ├── feature/xxx    # Nouvelles fonctionnalités
│   ├── bugfix/xxx     # Corrections de bugs
│   ├── hotfix/xxx     # Corrections urgentes
│   └── docs/xxx       # Documentation
```

### Conventions de Nommage

#### Branches
```bash
# Fonctionnalités
git checkout -b feature/add-traffic-prediction

# Corrections de bugs
git checkout -b bugfix/fix-parking-api

# Corrections urgentes
git checkout -b hotfix/fix-auth-bypass

# Documentation
git checkout -b docs/update-api-docs
```

#### Commits

Format : `type(scope): description`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactorisation
- `test` : Tests
- `chore` : Maintenance

```bash
# Exemples
git commit -m "feat(api): add traffic prediction endpoint"
git commit -m "fix(frontend): resolve parking map rendering issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(auth): add JWT validation tests"
```

## 📏 Standards de Code

### TypeScript

```typescript
// ✅ Bon
interface User {
  readonly id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id: number): Promise<User | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid user ID');
    }

    return this.userRepository.findById(id);
  }
}

// ❌ Mauvais
interface user {
  id: any;
  name: string;
  email: string;
}

class userservice {
  userrepo: any;

  getuser(id) {
    return this.userrepo.find(id);
  }
}
```

### React

```tsx
// ✅ Bon
import React, { useState, useEffect } from 'react';
import { TrafficData } from '../../types';

interface TrafficDashboardProps {
  refreshInterval?: number;
}

const TrafficDashboard: React.FC<TrafficDashboardProps> = ({
  refreshInterval = 30000
}) => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/traffic/current');
      const data = await response.json();
      setTrafficData(data);
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="traffic-dashboard">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <TrafficChart data={trafficData} />
      )}
    </div>
  );
};

export default TrafficDashboard;

// ❌ Mauvais
import React from 'react';

const TrafficDashboard = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/traffic').then(res => res.json()).then(setData);
  }, []);

  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
};

export default TrafficDashboard;
```

### API REST

```typescript
// ✅ Bon
// GET /api/traffic/current
app.get('/api/traffic/current', async (req, res) => {
  try {
    const trafficData = await trafficService.getCurrentTraffic();

    res.json({
      success: true,
      data: trafficData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get traffic data:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve traffic data'
      }
    });
  }
});

// ❌ Mauvais
app.get('/api/traffic', (req, res) => {
  trafficService.getTraffic().then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send('Error');
  });
});
```

## 🧪 Tests

### Tests Unitaires

```typescript
// tests/services/TrafficService.test.ts
import { TrafficService } from '../../src/services/TrafficService';
import { mockTrafficData } from '../fixtures/trafficData';

describe('TrafficService', () => {
  let trafficService: TrafficService;
  let mockRepository: jest.Mocked<TrafficRepository>;

  beforeEach(() => {
    mockRepository = {
      findByRouteId: jest.fn(),
      save: jest.fn()
    };

    trafficService = new TrafficService(mockRepository);
  });

  describe('getCurrentTraffic', () => {
    it('should return current traffic data', async () => {
      mockRepository.findByRouteId.mockResolvedValue(mockTrafficData);

      const result = await trafficService.getCurrentTraffic('a1');

      expect(result).toEqual(mockTrafficData);
      expect(mockRepository.findByRouteId).toHaveBeenCalledWith('a1');
    });

    it('should throw error for invalid route', async () => {
      mockRepository.findByRouteId.mockRejectedValue(new Error('Route not found'));

      await expect(trafficService.getCurrentTraffic('invalid'))
        .rejects
        .toThrow('Route not found');
    });
  });
});
```

### Tests d'Intégration

```typescript
// tests/integration/api/traffic.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../../utils/database';

describe('Traffic API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/traffic/current', () => {
    it('should return traffic data', async () => {
      const response = await request(app)
        .get('/api/traffic/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 429 when rate limited', async () => {
      // Simuler plusieurs requêtes rapides
      const promises = Array(15).fill().map(() =>
        request(app).get('/api/traffic/current')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status === 429);

      expect(rateLimitedResponse).toBeDefined();
    });
  });
});
```

### Tests End-to-End

```typescript
// tests/e2e/dashboard.test.ts
import { Page, Browser, BrowserContext } from 'playwright';

describe('Dashboard E2E', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await playwright.chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterEach(async () => {
    await context.close();
  });

  it('should load dashboard and display traffic data', async () => {
    await page.goto('http://localhost:3000');

    // Attendre le chargement
    await page.waitForSelector('.traffic-dashboard');

    // Vérifier la présence des données
    const trafficChart = await page.$('.traffic-chart');
    expect(trafficChart).toBeTruthy();

    // Vérifier la mise à jour temps réel
    const initialData = await page.$eval('.traffic-count', el => el.textContent);
    await page.waitForTimeout(35000); // Attendre une mise à jour
    const updatedData = await page.$eval('.traffic-count', el => el.textContent);

    expect(updatedData).not.toBe(initialData);
  });
});
```

### Couverture de Code

```bash
# Générer le rapport de couverture
npm run test:coverage

# Seuils minimums
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## 📚 Documentation

### Documentation du Code

```typescript
/**
 * Service de gestion des données de trafic
 * Gère la collecte, le traitement et la mise à jour des données de trafic
 */
class TrafficService {
  private readonly repository: TrafficRepository;
  private readonly logger: Logger;

  /**
   * Crée une nouvelle instance du service de trafic
   * @param repository - Repository pour accéder aux données de trafic
   * @param logger - Logger pour tracer les opérations
   */
  constructor(repository: TrafficRepository, logger: Logger) {
    this.repository = repository;
    this.logger = logger;
  }

  /**
   * Récupère les données de trafic actuelles pour une route donnée
   * @param routeId - Identifiant de la route
   * @returns Les données de trafic actuelles ou null si non trouvées
   * @throws {Error} Si la route n'existe pas
   */
  async getCurrentTraffic(routeId: string): Promise<TrafficData | null> {
    this.logger.info(`Fetching traffic data for route: ${routeId}`);

    try {
      const data = await this.repository.findByRouteId(routeId);

      if (!data) {
        this.logger.warn(`No traffic data found for route: ${routeId}`);
        return null;
      }

      this.logger.info(`Successfully retrieved traffic data for route: ${routeId}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch traffic data for route ${routeId}:`, error);
      throw new Error(`Traffic data retrieval failed: ${error.message}`);
    }
  }
}
```

### Documentation API

```typescript
/**
 * @swagger
 * /api/traffic/current:
 *   get:
 *     summary: Récupère les données de trafic actuelles
 *     tags: [Traffic]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: route
 *         schema:
 *           type: string
 *         description: Filtrer par route spécifique
 *     responses:
 *       200:
 *         description: Données de trafic récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrafficData'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Non autorisé
 *       429:
 *         description: Trop de requêtes
 */
```

## 🔄 Pull Requests

### Template de PR

```markdown
## Description
Décrivez brièvement les changements apportés.

## Type de changement
- [ ] 🐛 Correction de bug
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 💥 Changement cassant
- [ ] 📚 Documentation
- [ ] 🎨 Amélioration de l'interface
- [ ] 🔧 Amélioration technique

## Checklist
- [ ] Tests ajoutés/modifiés
- [ ] Documentation mise à jour
- [ ] Code respecte les standards
- [ ] Lint passe sans erreur
- [ ] Tests passent
- [ ] Revue par les pairs effectuée

## Tests
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests end-to-end
- [ ] Tests de performance

## Impact
Décrivez l'impact sur :
- Performance
- Sécurité
- Utilisabilité
- Maintenance

## Screenshots (si applicable)
Ajoutez des captures d'écran pour les changements d'interface.
```

### Processus de Revue

1. **Création de la PR**
   - Remplir le template complet
   - Assigner des reviewers appropriés
   - Lier les issues connexes

2. **Révision Automatique**
   - Tests automatiques (CI/CD)
   - Analyse de code (lint, sécurité)
   - Vérification de la couverture

3. **Révision Manuelle**
   - Revue du code par les pairs
   - Tests fonctionnels
   - Vérification de la documentation

4. **Approbation et Fusion**
   - Minimum 1 approbation requise
   - Résolution de tous les commentaires
   - Tests passant
   - Mise à jour automatique de la branche

## 🐛 Issues

### Template de Bug Report

```markdown
## Description du bug
Description claire et concise du bug.

## Étapes de reproduction
1. Aller à '...'
2. Cliquer sur '....'
3. Voir l'erreur

## Comportement attendu
Description de ce qui devrait se passer.

## Comportement actuel
Description de ce qui se passe actuellement.

## Screenshots
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS: [e.g. Windows 10]
- Navigateur: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

## Contexte additionnel
Ajoutez tout autre contexte sur le problème ici.
```

### Template de Feature Request

```markdown
## Résumé
Brève description de la fonctionnalité souhaitée.

## Problème actuel
Description du problème que cette fonctionnalité résoudrait.

## Solution proposée
Description de la solution souhaitée.

## Alternatives considérées
Décrivez les alternatives que vous avez envisagées.

## Impact
Décrivez l'impact de cette fonctionnalité sur :
- Utilisateurs
- Performance
- Sécurité
- Maintenance

## Priorité
- [ ] Faible
- [ ] Moyenne
- [ ] Élevée
- [ ] Critique
```

### Labels d'Issues

| Label | Description |
|-------|-------------|
| `bug` | Rapport de bug |
| `enhancement` | Amélioration ou nouvelle fonctionnalité |
| `documentation` | Documentation |
| `good first issue` | Idéal pour les nouveaux contributeurs |
| `help wanted` | Besoin d'aide pour cette issue |
| `priority:high` | Haute priorité |
| `priority:low` | Basse priorité |
| `status:blocked` | Bloquée par une autre issue |
| `status:in-progress` | En cours de traitement |

## 🎯 Bonnes Pratiques

### Communication
- Soyez respectueux et constructif
- Utilisez un langage clair et précis
- Fournissez un contexte suffisant
- Posez des questions si quelque chose n'est pas clair

### Code
- Écrivez du code lisible et maintenable
- Commentez les parties complexes
- Suivez les conventions établies
- Testez votre code

### Collaboration
- Travaillez sur une branche dédiée
- Faites des commits atomiques
- Écrivez des messages de commit clairs
- Demandez de l'aide si nécessaire

## 📞 Support

### Canaux de Communication

- **GitHub Issues** : Pour les bugs et demandes de fonctionnalités
- **GitHub Discussions** : Pour les questions générales
- **Slack** : Pour la communication en temps réel (invitation sur demande)
- **Email** : michael@germini.info (pour les questions privées)

### Réponse Attendue

- **Questions générales** : Réponse sous 24-48h
- **Issues critiques** : Réponse sous 4h
- **Pull requests** : Revue sous 1 semaine

## 🙏 Remerciements

Merci de contribuer au Smart City Dashboard ! Votre participation aide à améliorer la mobilité urbaine de Genève pour tous les citoyens.

---

*Dernière mise à jour : Janvier 2024*
