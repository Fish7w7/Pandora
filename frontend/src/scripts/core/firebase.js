/* ══════════════════════════════════════════════════
   FIREBASE.JS v1.0.0 — NyanTools にゃん~ v3.9.0
   Módulo central de conexão Firebase
   ── Inicialização · Auth · Firestore · RTDB ──
 ═══════════════════════════════════════════════════

   SETUP:
   1. Crie um projeto em https://console.firebase.google.com
   2. Ative: Authentication (Anonymous + Email/Password) e Firestore
   3. Cole seu firebaseConfig abaixo substituindo os placeholders
   4. Defina as regras do Firestore (ver docs/firestore-rules.txt)

 ═══════════════════════════════════════════════════*/

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Substitua com os valores do seu projeto Firebase Console:
// Projeto → Configurações do projeto → Seus apps → SDK do Firebase

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyChGdu1TgEHiA_iYWEu4IqHu-d1UAuCQy4",
  authDomain: "nyan-network-e1ecf.firebaseapp.com",
  projectId: "nyan-network-e1ecf",
  storageBucket: "nyan-network-e1ecf.firebasestorage.app",
  messagingSenderId: "1069283085488",
  appId: "1:1069283085488:web:21aee7cda4a2a6629a7f75",
  measurementId: "G-RPNWFK2BDH",
  // Realtime Database — copie a URL em: Firebase Console → Realtime Database → Dados
  // Formato: https://SEU-PROJETO-default-rtdb.firebaseio.com
  // Deixe vazio ("") para desabilitar presença e usar só Firestore
  databaseURL: "https://nyan-network-e1ecf-default-rtdb.firebaseio.com"
};

// ─── SDK URLS (CDN — sem bundler necessário) ──────────────────────────────────
const FB_VERSION = '10.12.2';
const FB_BASE    = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

const FB_SDKS = {
    app:       `${FB_BASE}/firebase-app.js`,
    auth:      `${FB_BASE}/firebase-auth.js`,
    firestore: `${FB_BASE}/firebase-firestore.js`,
    database:  `${FB_BASE}/firebase-database.js`,
    storage:   `${FB_BASE}/firebase-storage.js`,
};

// ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
const NyanFirebase = {
    app:       null,
    auth:      null,
    db:        null,   // Firestore
    rtdb:      null,   // Realtime Database (presença)
    storage:   null,
    ready:     false,
    _listeners: [],

    // ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────

    async init() {
        if (this.ready) return true;

        // Verificar se config foi preenchido (ainda tem placeholder)
        if (FIREBASE_CONFIG.apiKey === 'COLE_SUA_API_KEY') {
            console.warn('[Firebase] ⚠️ firebaseConfig não configurado — modo offline');
            this._setOfflineMode();
            return false;
        }

        try {
            await this._loadSDKs();
            this._initServices();
            this._setupPresence();
            this.ready = true;
            console.log('[Firebase] ✅ Conectado ao projeto:', FIREBASE_CONFIG.projectId);
            return true;
        } catch (err) {
            console.error('[Firebase] ❌ Falha na inicialização:', err.message);
            this._setOfflineMode();
            return false;
        }
    },

    // Carrega os SDKs dinamicamente via import()
    async _loadSDKs() {
        const [appMod, authMod, fsMod, dbMod, storageMod] = await Promise.all([
            import(FB_SDKS.app),
            import(FB_SDKS.auth),
            import(FB_SDKS.firestore),
            import(FB_SDKS.database),
            import(FB_SDKS.storage),
        ]);

        // Guardar referências dos módulos no escopo do NyanFirebase
        this._mod = { appMod, authMod, fsMod, dbMod, storageMod };
    },

    _initServices() {
        const { initializeApp }        = this._mod.appMod;
        const { getAuth }              = this._mod.authMod;
        const { getFirestore }         = this._mod.fsMod;
        const { getDatabase }          = this._mod.dbMod;
        const { getStorage }           = this._mod.storageMod;

        this.app     = initializeApp(FIREBASE_CONFIG);
        this.auth    = getAuth(this.app);
        this.db      = getFirestore(this.app);
        this.storage = getStorage(this.app);

        // Realtime Database é opcional — só inicializa se databaseURL estiver configurado
        if (FIREBASE_CONFIG.databaseURL) {
            try {
                this.rtdb = getDatabase(this.app);
            } catch(e) {
                console.warn('[Firebase] RTDB indisponível:', e.message);
                this.rtdb = null;
            }
        }

        console.log('[Firebase] ✅ Serviços inicializados — projeto:', FIREBASE_CONFIG.projectId);

        // Expor módulos para uso nos outros arquivos
        this.fn = {
            // Firestore
            doc:         this._mod.fsMod.doc,
            collection:  this._mod.fsMod.collection,
            getDoc:      this._mod.fsMod.getDoc,
            setDoc:      this._mod.fsMod.setDoc,
            updateDoc:   this._mod.fsMod.updateDoc,
            deleteDoc:   this._mod.fsMod.deleteDoc,
            addDoc:      this._mod.fsMod.addDoc,
            getDocs:     this._mod.fsMod.getDocs,
            query:       this._mod.fsMod.query,
            where:       this._mod.fsMod.where,
            orderBy:     this._mod.fsMod.orderBy,
            limit:       this._mod.fsMod.limit,
            onSnapshot:  this._mod.fsMod.onSnapshot,
            serverTimestamp: this._mod.fsMod.serverTimestamp,
            arrayUnion:  this._mod.fsMod.arrayUnion,
            arrayRemove: this._mod.fsMod.arrayRemove,
            increment:   this._mod.fsMod.increment,
            Timestamp:   this._mod.fsMod.Timestamp,

            // Auth
            signInAnonymously:              this._mod.authMod.signInAnonymously,
            signInWithEmailAndPassword:     this._mod.authMod.signInWithEmailAndPassword,
            createUserWithEmailAndPassword: this._mod.authMod.createUserWithEmailAndPassword,
            sendPasswordResetEmail:         this._mod.authMod.sendPasswordResetEmail,
            onAuthStateChanged:             this._mod.authMod.onAuthStateChanged,
            signOut:                        this._mod.authMod.signOut,
            updateProfile:                  this._mod.authMod.updateProfile,

            // Realtime Database (presença)
            ref:      this._mod.dbMod.ref,
            set:      this._mod.dbMod.set,
            get:      this._mod.dbMod.get,
            onValue:  this._mod.dbMod.onValue,
            onDisconnect: this._mod.dbMod.onDisconnect,
            serverTimestampRTDB: this._mod.dbMod.serverTimestamp,

            // Storage
            storageRef: this._mod.storageMod.ref,
            uploadBytes: this._mod.storageMod.uploadBytes,
            getDownloadURL: this._mod.storageMod.getDownloadURL,
        };
    },

    // ── PRESENÇA (online/offline em tempo real) ───────────────────────────────

    _setupPresence() {
        if (!this.rtdb) return; // RTDB não configurado
        const { onAuthStateChanged } = this._mod.authMod;
        onAuthStateChanged(this.auth, (user) => {
            if (user) this._registerPresence(user.uid);
        });
    },

    _registerPresence(uid) {
        // Setar online no Firestore
        this.updateDoc(`users/${uid}`, { status: 'online', lastSeen: this.fn.serverTimestamp() }).catch(() => {});

        // Fallback: beforeunload seta offline no Firestore imediatamente
        window.addEventListener('beforeunload', () => {
            this.updateDoc(`users/${uid}`, { status: 'offline' }).catch(() => {});
        });

        if (!this.rtdb) return;

        const { ref, set, onDisconnect, serverTimestamp, onValue } = this.fn;
        const presenceRef = ref(this.rtdb, `presence/${uid}`);

        // Setar online/offline no RTDB
        set(presenceRef, { online: true,  lastSeen: serverTimestamp() });
        onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() });

        // Ouvir RTDB e sincronizar status no Firestore
        if (onValue) {
            onValue(presenceRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) return;
                this.updateDoc(`users/${uid}`, {
                    status: data.online ? 'online' : 'offline',
                    lastSeen: this.fn.serverTimestamp()
                }).catch(() => {});
            });
        }
    },

    // ── MODO OFFLINE ──────────────────────────────────────────────────────────

    _setOfflineMode() {
        this.ready = false;
        // Expor stubs para não quebrar chamadas de código
        this.fn = new Proxy({}, {
            get: () => () => Promise.resolve(null)
        });
        window.dispatchEvent(new CustomEvent('nyan:firebase-offline'));
    },

    // ── HELPERS UTILITÁRIOS ───────────────────────────────────────────────────

    // Gera referência de documento
    docRef(path) {
        return this.fn.doc(this.db, path);
    },

    // Gera referência de coleção
    colRef(path) {
        return this.fn.collection(this.db, path);
    },

    // Ler documento único
    async getDoc(path) {
        try {
            const snap = await this.fn.getDoc(this.docRef(path));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (err) {
            console.error('[Firebase] getDoc erro:', path, err.message);
            return null;
        }
    },

    // Escrever/sobrescrever documento
    async setDoc(path, data, merge = true) {
        try {
            await this.fn.setDoc(this.docRef(path), data, { merge });
            return true;
        } catch (err) {
            console.error('[Firebase] setDoc erro:', path, err.message);
            return false;
        }
    },

    // Atualizar campos específicos
    async updateDoc(path, data) {
        try {
            await this.fn.updateDoc(this.docRef(path), data);
            return true;
        } catch (err) {
            console.error('[Firebase] updateDoc erro:', path, err.message);
            return false;
        }
    },

    // Registrar listener em tempo real (retorna função de cleanup)
    onSnapshot(path, callback) {
        if (!this.ready) return () => {};
        const ref = typeof path === 'string' ? this.docRef(path) : path;
        const unsub = this.fn.onSnapshot(ref, (snap) => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() });
            else callback(null);
        });
        this._listeners.push(unsub);
        return unsub;
    },

    // Limpar todos os listeners (chamado no logout)
    cleanupListeners() {
        this._listeners.forEach(unsub => { try { unsub(); } catch(_) {} });
        this._listeners = [];
    },

    // ── STATUS ────────────────────────────────────────────────────────────────

    isReady() { return this.ready; },
    isOffline() { return !this.ready; },

    getDebugInfo() {
        return {
            ready:     this.ready,
            project:   FIREBASE_CONFIG.projectId,
            authUser:  this.auth?.currentUser?.uid || null,
        };
    },
};

// ─── AUTO-INIT ao carregar ────────────────────────────────────────────────────
// Inicializa assim que o script carrega para estar pronto quando o login ocorrer
// O App.showMainApp() vai encontrar o Firebase já conectado na primeira vez
document.addEventListener('DOMContentLoaded', () => {
    NyanFirebase.init().catch(() => {});
});

window.NyanFirebase = NyanFirebase;