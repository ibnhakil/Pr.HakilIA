
# MathisChess

> Jeu d’échecs moderne avec IA pédagogique – powered by Pr.HakilIA

---

🎯 Objectif : Crée une application d’échecs moderne, jouable contre une IA ou un autre joueur, avec une interface inspirée de Chess.com, une IA visible appelée **Pr.HakilIA**, et un moteur **Stockfish** intégré et fonctionnel.

## 🔲 Plateau & Design

- Échiquier **inspiré de Chess.com**, clair, élégant et lisible
- Thèmes : clair / sombre / bois / classique
- Animation fluide des déplacements
- Déplacement par **clic** ou **drag & drop**
- Affichage :
  - coups légaux
  - dernier coup
  - pièces capturées
  - historique des coups (notation)

## ♟ Moteur IA – ⚠️ IMPORTANT

- Utiliser **Stockfish.js réel** (via WebWorker ou import) :
  - `const stockfish = new Worker('stockfish.js')` OU `import stockfish from 'stockfish';`
- L’IA doit :
  - **s’activer automatiquement** après le coup du joueur
  - jouer son coup et le **montrer sur le plateau**
  - réagir via une interface Coach (voir ci-dessous)
- Pas de console.log seul. Le moteur doit répondre à :
  - `uci`, `position fen`, `go depth 10`, `bestmove`

## 🧠 Coach IA visible – Pr.HakilIA

- Affiché à droite du plateau (visage ou avatar animé)
- Commente chaque coup (bon ou mauvais) avec phrases comme :
  - “Ce coup affaiblit ta défense.” / “Excellente structure.”
- Affiche l’analyse post-partie :
  - Score ELO estimé
  - Pourcentage de précision
  - Coups clés

## 🎮 Modes de jeu

- Solo contre IA
- Joueur contre joueur local (sur même ordi)
- Option future : matchmaking en ligne (Firebase ou WebSocket)

## 👤 Joueurs & Personnalisation

- Entrée du prénom/pseudo
- Affichage des noms au-dessus des camps
- Choix du thème visuel
- Sons activables
- Statistiques post-match (précision, style de jeu)

## 🧱 Stack technique

- **React + Tailwind + Vite**
- **Chess.js** pour la logique
- **Stockfish.js** pour l’IA (chargé et actif)
- (Optionnel) Firebase si on ajoute un mode online plus tard

---

✅ Attention : dans la version précédente, le moteur IA **n’était pas actif**.
Il faut s’assurer que :
- le moteur est bien chargé (Worker ou import)
- chaque coup du joueur déclenche un `go` de l’IA
- le plateau est mis à jour quand l’IA joue

Nom de l’IA : **Pr.HakilIA**  
Nom de l’app : **MathisChess**
