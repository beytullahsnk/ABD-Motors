# Corrections des modèles Django pour le déploiement sur AWS Lightsail

Ce document explique les modifications apportées aux modèles Django pour les faire correspondre à la structure existante de la base de données PostgreSQL sur AWS RDS, tout en maintenant la compatibilité avec le frontend.

## Problème identifié

Lors du déploiement sur AWS Lightsail, des erreurs se produisaient car les modèles Django ne correspondaient pas exactement à la structure des tables PostgreSQL existantes. Par exemple, l'erreur "ProgrammingError: column vehicles.is_available does not exist" empêchait l'accès à l'interface d'administration.

## Solution adoptée

Nous avons choisi une approche qui permet de conserver la compatibilité avec le frontend tout en respectant la structure de la base de données existante.

### 1. Modèle Vehicle

Le modèle `Vehicle` a été modifié pour correspondre à la table `vehicles` de la base de données tout en exposant les propriétés nécessaires au frontend :

- Ajout d'une propriété calculée `is_available` qui est déterminée en fonction du champ `state`
- Ajout de propriétés calculées `created_at` et `updated_at` qui pointent vers `date_added`
- Ajout des champs manquants qui existent dans la base de données :
  - `engine_size`
  - `fuel_type`
  - `maintenance_book`
  - `power`
  - `technical_control`
  - `transmission`
- Spécification explicite du nom de la table avec `db_table = 'vehicles'`
- Modification de l'option `ordering` pour utiliser `date_added`

### 2. Sérialiseurs Vehicle

Les sérialiseurs ont été adaptés pour prendre en compte ces changements :

- Ajout explicite du champ `is_available` comme champ en lecture seule
- Ajout des champs `created_at` et `updated_at` comme champs en lecture seule
- Inclusion des nouveaux champs techniques dans le sérialiseur détaillé

### 3. Filtres

La classe `VehicleFilter` a été modifiée pour supporter le filtrage par `is_available` en le transformant en un filtrage par `state` :

- Ajout d'un filtre personnalisé qui mappe `is_available=True` à `state='AVAILABLE'`

### 4. Modèle File

Le modèle `File` a été mis à jour pour spécifier explicitement le nom de table `db_table = 'files'`.

### 5. Migrations spéciales

Deux migrations spéciales ont été créées pour synchroniser les modèles Django avec la structure existante de la base de données sans modifier les données existantes :

- `vehicle/migrations/0005_auto_match_database_schema.py`
- `folder/migrations/0003_auto_match_database_schema.py`

### 6. Script de déploiement

Le script de déploiement `deploy.sh` a été modifié pour utiliser l'option `--fake` lors de l'application des migrations, ce qui indique à Django que les migrations ont déjà été appliquées sans essayer de modifier la structure de la base de données.

## Comment cela fonctionne

Ce nouveau modèle offre plusieurs avantages :

1. **Compatibilité avec la base de données :** Le modèle n'essaie pas de créer des colonnes qui n'existent pas dans la base de données
2. **Compatibilité avec le frontend :** L'API continue de fournir les mêmes champs que ceux attendus par le frontend
3. **Facilité de maintenance :** Les propriétés calculées permettent de maintenir la compatibilité sans dupliquer les données

Lorsque le frontend demande `is_available`, la propriété calculée retourne une valeur basée sur le champ `state`, ce qui permet au frontend de continuer à fonctionner sans modification.

## Remarques importantes

- Cette approche est une solution intermédiaire qui permet de déployer rapidement l'application sans modifier le frontend
- Pour une solution à long terme, il serait recommandé d'aligner complètement le modèle de données et le frontend
- Comme le champ `is_available` est calculé à partir de `state`, la logique métier reste cohérente
- Cette solution minimise les risques lors du déploiement tout en préservant l'expérience utilisateur 