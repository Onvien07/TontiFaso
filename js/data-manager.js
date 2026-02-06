const DataManager = {
    // Storage keys (kept for fallback/cache)
    KEYS: {
        MEMBERS: 'tontifaso_members',
        DEPOSITS: 'tontifaso_deposits',
        LOANS: 'tontifaso_loans',
        GUARANTEES: 'tontifaso_guarantees',
        PAYMENTS: 'tontifaso_payments'
    },

    API_BASE: 'backend/api',

    async init() {
        console.log('DataManager: Initializing and syncing with backend...');
        await this.sync();
    },

    async sync() {
        try {
            console.log('DataManager: Fetching data from backend...');
            const response = await fetch(`${this.API_BASE}/get_data.php?t=${Date.now()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                const data = result.data;

                // Populate localStorage as a cache
                localStorage.setItem(this.KEYS.MEMBERS, JSON.stringify(data.members || []));
                localStorage.setItem(this.KEYS.DEPOSITS, JSON.stringify(data.deposits || []));
                localStorage.setItem(this.KEYS.LOANS, JSON.stringify(data.loans || []));
                localStorage.setItem(this.KEYS.GUARANTEES, JSON.stringify(data.guarantees || []));
                localStorage.setItem(this.KEYS.PAYMENTS, JSON.stringify(data.payments || []));

                console.log(`DataManager: Sync successful! 
                    - Members: ${data.members?.length || 0}
                    - Deposits: ${data.deposits?.length || 0}
                    - Loans: ${data.loans?.length || 0}
                    - Guarantees: ${data.guarantees?.length || 0}
                    - Payments: ${data.payments?.length || 0}`);
            } else {
                console.error('DataManager: Backend reported failure:', result.message);
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('Erreur de synchronisation: ' + result.message, 'danger');
                }
            }
        } catch (error) {
            console.error('DataManager: Sync failed critical error:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('Erreur critique de synchronisation. Vérifiez la console.', 'danger');
            }
        }
    },

    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    // Standard synchronous getters for UI (using the cache populated by sync)
    getMembers() { return this.getData(this.KEYS.MEMBERS); },
    getMember(id) { return this.getMembers().find(m => m.id == id); },
    getDeposits() { return this.getData(this.KEYS.DEPOSITS); },
    getMemberDeposits(memberId) { return this.getDeposits().filter(d => d.memberId == memberId); },
    getLoans() { return this.getData(this.KEYS.LOANS); },
    getLoan(id) { return this.getLoans().find(l => l.id == id); },
    getMemberLoans(memberId) { return this.getLoans().filter(l => l.memberId == memberId); },
    getPayments() { return this.getData(this.KEYS.PAYMENTS); },
    getLoanPayments(loanId) { return this.getPayments().filter(p => p.loanId == loanId); },
    getGuarantees() { return this.getData(this.KEYS.GUARANTEES); },
    getLoanGuarantees(loanId) { return this.getGuarantees().filter(g => g.loanId == loanId); },
    getMemberGuarantees(memberId) {
        return this.getGuarantees().filter(g => {
            const loan = this.getLoan(g.loanId);
            return loan && loan.memberId == memberId;
        });
    },

    // Async Setters (Send to backend then refresh cache)
    async addMember(member) {
        const result = await this.postData('backend/auth/register.php', {
            fullname: `${member.firstName} ${member.lastName}`,
            email: member.email,
            password: 'password123', // Default password for new members
            phone: member.phone,
            firstName: member.firstName,
            lastName: member.lastName,
            address: member.address,
            joinDate: member.joinDate
        });
        await this.sync();
        return result;
    },

    async updateMember(id, member) {
        const result = await this.postData(`${this.API_BASE}/update_member.php`, {
            id: id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            address: member.address,
            joinDate: member.joinDate
        });
        await this.sync();
        return result;
    },

    async addDeposit(deposit) {
        const result = await this.postData('backend/contributions/add.php', {
            tontine_id: 1, // Default tontine
            member_id: deposit.memberId,
            amount: deposit.amount,
            contribution_date: deposit.date,
            description: deposit.description
        });
        await this.sync();
        return result;
    },

    async deleteDeposit(id) {
        const result = await this.postData(`${this.API_BASE}/delete_deposit.php`, {
            id: id
        });
        await this.sync();
        return result;
    },

    async addLoan(loan) {
        const result = await this.postData(`${this.API_BASE}/add_loan.php`, {
            memberId: loan.memberId,
            principal: loan.principal,
            interestRate: loan.interestRate,
            duration: loan.duration,
            startDate: loan.startDate,
            description: loan.description
        });
        await this.sync();
        return result;
    },

    async deleteLoan(id) {
        const result = await this.postData(`${this.API_BASE}/delete_loan.php`, {
            id: id
        });
        await this.sync();
        return result;
    },

    async addGuarantee(guarantee) {
        const result = await this.postData(`${this.API_BASE}/add_guarantee.php`, {
            loanId: guarantee.loanId,
            type: guarantee.type,
            value: guarantee.value,
            description: guarantee.description
        });
        await this.sync();
        return result;
    },

    async deleteGuarantee(id) {
        const result = await this.postData(`${this.API_BASE}/delete_guarantee.php`, {
            id: id
        });
        await this.sync();
        return result;
    },

    async addPayment(payment) {
        const result = await this.postData(`${this.API_BASE}/add_payment.php`, {
            loanId: payment.loanId,
            memberId: DataManager.getLoan(payment.loanId)?.memberId,
            amount: payment.amount,
            date: payment.date,
            type: 'repayment'
        });
        await this.sync();
        return result;
    },

    async deleteMember(id) {
        const result = await this.postData(`${this.API_BASE}/delete_member.php`, {
            id: id
        });
        await this.sync();
        return result;
    },

    async postData(url, data) {
        const formData = new FormData();
        for (const key in data) formData.append(key, data[key]);
        const response = await fetch(url, { method: 'POST', body: formData });
        return await response.json();
    },

    async clearAll() {
        // In a real app, this would call a backend reset endpoint
        // For now, let's at least clear localStorage
        localStorage.clear();
        console.log('DataManager: Local storage cleared');
    }
};
