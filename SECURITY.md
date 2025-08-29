# 🔒 Politique de Sécurité

## 📢 Rapport de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité dans ce projet, veuillez nous en informer de manière responsable.

### 🚨 Comment Signaler une Vulnérabilité

**Ne créez pas d'issue publique** pour les vulnérabilités de sécurité.

Au lieu de cela, contactez-nous directement :

- 📧 **Email** : michael@germini.info
- 🔐 **PGP Key** : [Télécharger la clé PGP](https://github.com/smartcity-geneva/dashboard/security/pgp-key)

### 📝 Informations à Fournir

Veuillez inclure dans votre rapport :

1. **Description** : Description claire de la vulnérabilité
2. **Impact** : Impact potentiel sur les utilisateurs/système
3. **Reproduction** : Étapes pour reproduire le problème
4. **Environnement** : Version affectée, configuration, etc.
5. **Solution proposée** : Si vous en avez une

### ⏱️ Délais de Réponse

- **Accusé de réception** : Sous 24 heures
- **Mise à jour initiale** : Sous 72 heures
- **Résolution** : Selon la criticité (1-90 jours)

## 🔍 Vulnérabilités Connues

Consultez notre [CHANGELOG](CHANGELOG.md) pour les dernières corrections de sécurité.

### Classifications de Sévérité

| Niveau | Description | Impact |
|--------|-------------|---------|
| **Critique** | Vulnérabilité permettant l'exécution de code à distance | Très élevé |
| **Élevé** | Vulnérabilité permettant l'accès non autorisé aux données | Élevé |
| **Moyen** | Vulnérabilité avec impact limité | Moyen |
| **Faible** | Vulnérabilité mineure avec peu d'impact | Faible |

## 🛡️ Mesures de Sécurité

### Authentification
- JWT avec expiration automatique
- Mots de passe hashés (bcrypt)
- Tentatives de connexion limitées

### Autorisation
- Contrôle d'accès basé sur les rôles (RBAC)
- Validation des permissions côté serveur
- Audit des actions sensibles

### Données
- Chiffrement en transit (HTTPS/TLS 1.2+)
- Validation des entrées utilisateur
- Protection contre les injections (SQL, XSS, CSRF)

### Infrastructure
- Rate limiting sur toutes les APIs
- Monitoring et logging continus
- Mises à jour de sécurité régulières

## 📞 Support de Sécurité

Pour toute question concernant la sécurité :

- 📖 **Documentation** : [SECURITY.md](SECURITY.md)
- 🐛 **Issues générales** : [GitHub Issues](https://github.com/smartcity-geneva/dashboard/issues)
- 📧 **Sécurité** : michael@germini.info

---

*Dernière mise à jour : Janvier 2024*
