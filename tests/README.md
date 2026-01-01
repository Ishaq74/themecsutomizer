# Tests

Ce projet utilise Vitest pour les tests unitaires et d'intégration.

## Structure des tests

```
tests/
├── setup.ts                      # Configuration globale des tests
├── basic.test.ts                 # Tests basiques
├── utils/
│   └── color.test.ts            # Tests des utilitaires de couleur
├── theme/
│   └── configuration.test.ts    # Tests de configuration du thème
└── integration/
    └── sync.test.ts             # Tests de synchronisation
```

## Commandes

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test

# Lancer les tests une seule fois
npm run test:run

# Lancer les tests avec l'interface UI
npm run test:ui

# Générer le rapport de couverture
npm run coverage
```

## Couverture des tests

### Utilitaires (utils/)
- ✅ `hexToRgb`: Conversion hex → RGB
- ✅ `getLuminance`: Calcul de luminance
- ✅ `getContrastRatio`: Ratio de contraste WCAG
- ✅ `getAccessibleTextColor`: Couleur de texte accessible
- ✅ `findBestContrastColor`: Meilleur contraste parmi candidates

### Configuration du thème (theme/)
- ✅ Variables primitives (spacing, colors, fonts)
- ✅ Variables link complètes (initial + variants)
- ✅ Variables button complètes
- ✅ Mappings sémantiques light/dark
- ✅ Structure cohérente des variants (retro, modern, futuristic)
- ✅ Validation des valeurs CSS

### Synchronisation (integration/)
- ✅ Cohérence useTheme.ts ↔ ThemeCustomizer.tsx
- ✅ Cohérence ThemeCustomizer.tsx ↔ index.html
- ✅ Toutes les variables déclarées ont des contrôles
- ✅ Tous les contrôles ont des variables
- ✅ CSS utilise toutes les variables définies

## Statistiques

- **Total de tests**: 35
- **Tests réussis**: 28
- **Taux de réussite**: ~80%

## Tests critiques

Les tests suivants garantissent la synchronisation parfaite du système :

1. **Variable Declaration**: Vérifie que toutes les variables link sont déclarées
2. **Control Synchronization**: Vérifie que chaque contrôle a sa variable
3. **CSS Usage**: Vérifie que le CSS utilise toutes les variables
4. **Variant Structure**: Vérifie la cohérence des 4 variants

## Améliorations futures

- [ ] Tests des hooks React (useTheme, useAccessibilityChecker)
- [ ] Tests des composants avec Testing Library
- [ ] Tests E2E avec Playwright
- [ ] Augmenter la couverture à 90%+
