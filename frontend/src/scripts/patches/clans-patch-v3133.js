(function patchClansV3133() {
    const wait = (test, fn, delay = 250) => {
        if (test()) {
            fn();
            return;
        }
        setTimeout(() => wait(test, fn, delay), delay);
    };

    wait(() => window.Squads && window.SquadsUI, () => {
        if (window.__clansPatchV3133Done) return;
        window.__clansPatchV3133Done = true;

        window.Clans = window.Squads;
        window.ClansUI = window.SquadsUI;

        window.addEventListener('nyan:squad:onGoalCompleted', (event) => {
            const goal = event.detail?.goal;
            if (goal?.description && window.Router?.currentRoute === 'squads') {
                window.Utils?.showNotification?.(`Meta do Clã concluida: ${goal.description}`, 'success');
            }
        });

        window.addEventListener('nyan:squad:onRewardDistributed', (event) => {
            const amount = Number(event.detail?.amount || 0).toLocaleString('pt-BR');
            if (window.Router?.currentRoute === 'squads') {
                window.Utils?.showNotification?.(`${amount} chips distribuidos pelo Clã.`, 'success');
            }
        });

        window.addEventListener('nyan:squad:onChallengeEnded', () => {
            if (window.Router?.currentRoute === 'squads') {
                window.SquadsUI?.refresh?.({ silent: true });
            }
        });
    });
})();
