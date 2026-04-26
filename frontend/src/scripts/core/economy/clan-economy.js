const ClanEconomy = {
    calculateSplit(squad, amount) {
        const total = Math.max(0, Math.floor(Number(amount || 0)));
        const members = Array.isArray(squad?.members) ? squad.members.filter((member) => member?.userId) : [];
        if (!squad?.id || total <= 0) return { ok: false, error: 'Recompensa invalida.' };
        if (!members.length) return { ok: false, error: 'Nenhum membro ativo para receber recompensa.' };
        if (Number(squad.balance || 0) < total) return { ok: false, error: 'Cofre sem saldo suficiente.' };

        const share = Math.floor(total / members.length);
        if (share <= 0) return { ok: false, error: 'Recompensa pequena demais para dividir.' };

        const distributed = share * members.length;
        return {
            ok: true,
            amount: distributed,
            share,
            recipients: members.map((member) => ({
                userId: member.userId,
                amount: share,
            })),
            remainder: total - distributed,
        };
    },

    distributeReward(squad, amount, meta = {}) {
        const split = this.calculateSplit(squad, amount);
        if (!split.ok) return split;
        const currentUid = String(window.NyanAuth?.getUID?.() || '').trim();
        const recipients = split.recipients;

        if (currentUid && recipients.some((item) => item.userId === currentUid)) {
            window.Economy?.grantChips?.(split.share);
            const syncResult = window.NyanAuth?.syncProfileToCloud?.({ includeEconomy: true });
            if (syncResult?.catch) syncResult.catch(() => {});
        }

        if (window.NyanFirebase?.isReady?.() && window.NyanFirebase?.fn?.increment) {
            recipients.forEach((recipient) => {
                window.NyanFirebase.updateDoc(`users/${recipient.userId}`, {
                    chips: window.NyanFirebase.fn.increment(recipient.amount),
                    clanRewardLastAt: window.NyanFirebase.fn.serverTimestamp(),
                    clanRewardLastMeta: {
                        squadId: squad.id,
                        goalId: meta.goalId || null,
                        description: meta.description || '',
                    },
                }).catch(() => {});
            });
        }

        return {
            ok: true,
            amount: split.amount,
            share: split.share,
            recipients,
            remainder: split.remainder,
        };
    },
};

window.ClanEconomy = ClanEconomy;
