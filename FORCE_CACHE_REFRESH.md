# 🔄 FORCE SUPABASE CACHE REFRESH

Vous avez ajouté les colonnes mais l'erreur persiste? 
Le problème = **cache Supabase** pas rafraîchi.

---

## ⚡ **Solution Rapide (3 étapes)**

### **Étape 1: Vérifier que les colonnes existent**

Dans **Supabase Dashboard → SQL Editor**, exécutez:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scans'
ORDER BY column_name;
```

**Vous DEVEZ voir:**
- ✅ `front_image_path` (text)
- ✅ `side_image_path` (text)

Si elles n'apparaissent PAS, re-exécutez:
```sql
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS front_image_path TEXT,
ADD COLUMN IF NOT EXISTS side_image_path TEXT;
```

---

### **Étape 2: Forcer le rafraîchissement du cache**

#### **Option A: Redémarrer Supabase (Recommandé)**
1. **Supabase Dashboard** → **Settings** → **General**
2. Cliquez **"Restart project"** ou **"Pause project"** puis **"Resume"**
3. Attendez 30-60 secondes

#### **Option B: Attendre 5 minutes**
- Le cache Supabase se rafraîchit automatiquement toutes les 5 minutes
- Attendez simplement 5 minutes après avoir exécuté le SQL

#### **Option C: Forcer via code**
Dans votre terminal:
```bash
# Arrêter le serveur dev (Ctrl+C)
# Puis:
npm run dev
```

---

### **Étape 3: Nettoyer le navigateur**

Dans **DevTools Console** de votre navigateur:
```javascript
// Effacer tout
localStorage.clear();
sessionStorage.clear();

// Recharger
location.reload();
```

Ou plus simple: **Mode navigation privée / incognito**

---

## 🧪 **Test Complet**

1. **Ouvrez un nouvel onglet en mode privé**
2. **Allez sur votre app**
3. **Faites un nouveau scan**
4. **Créez un compte**
5. **Vérifiez les logs console**

---

## 🔍 **Vérification Base de Données**

Après le rafraîchissement, testez l'insertion manuelle:

```sql
-- Test d'insertion
INSERT INTO scans (
  user_id, 
  front_image_path, 
  side_image_path,
  scores_json,
  notes_json
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),  -- Utilisez votre user_id
  'test/test/front.jpg',
  'test/test/side.jpg',
  '{"overall": 75}'::jsonb,
  '{}'::jsonb
) RETURNING id;

-- Si ça fonctionne, supprimez le test:
DELETE FROM scans WHERE front_image_path = 'test/test/front.jpg';
```

**Si l'INSERT fonctionne:** Les colonnes existent, c'est juste un problème de cache.

**Si l'INSERT échoue:** Les colonnes n'ont pas été créées correctement.

---

## ⚠️ **Si ça ne marche toujours pas:**

### **Vérifier la connexion Supabase**

Dans votre code, vérifiez les variables d'environnement:

```javascript
// Dans DevTools Console:
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
```

**Assurez-vous** que l'URL correspond à votre projet Supabase actuel.

---

## 📊 **Checklist de Debug**

- [ ] Colonnes existent dans Supabase (vérifié via SQL)
- [ ] Supabase redémarré OU attendu 5 minutes
- [ ] Serveur dev redémarré (`npm run dev`)
- [ ] Navigateur en mode privé / localStorage effacé
- [ ] Variables d'environnement correctes
- [ ] Test d'insertion manuelle réussi

---

## 🚀 **Actions Immédiates**

1. **Redémarrez Supabase** (Settings → Restart project)
2. **Attendez 1 minute**
3. **Redémarrez votre serveur dev** (Ctrl+C puis `npm run dev`)
4. **Mode privé dans le navigateur**
5. **Testez un nouveau scan**

---

**Temps estimé:** 2-3 minutes d'attente après le restart
