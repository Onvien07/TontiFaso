const Calculations = {

    /**
     * Calculate loan details with simple interest
     * Formula: Interest = Principal × (Rate/100) × (Duration/12)
     * 
     * @param {number} principal - Loan amount
     * @param {number} interestRate - Monthly interest rate (%)
     * @param {number} duration - Loan duration in months
     * @returns {object} Calculation results
     */
    calculateLoan(principal, interestRate, duration) {
        principal = parseFloat(principal);
        interestRate = parseFloat(interestRate);
        duration = parseInt(duration);

        // Calculate total interest (simple interest)
        // Interest = Principal × Rate × Time
        const totalInterest = principal * (interestRate / 100) * duration;

        // Total amount to repay
        const totalAmount = principal + totalInterest;

        // Monthly payment
        const monthlyPayment = totalAmount / duration;

        return {
            principal: principal,
            interestRate: interestRate,
            duration: duration,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100
        };
    },

    /**
     * Calculate remaining balance after payments
     * 
     * @param {number} totalAmount - Total loan amount
     * @param {number} paidAmount - Amount already paid
     * @returns {number} Remaining balance
     */
    calculateRemainingBalance(totalAmount, paidAmount) {
        return Math.round((totalAmount - paidAmount) * 100) / 100;
    },

    /**
     * Calculate total deposits for a member
     * 
     * @param {string} memberId - Member ID
     * @returns {number} Total deposits
     */
    getMemberTotalDeposits(memberId) {
        const deposits = DataManager.getMemberDeposits(memberId);
        return deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    },

    /**
     * Calculate total loans for a member
     * 
     * @param {string} memberId - Member ID
     * @returns {number} Total loans
     */
    getMemberTotalLoans(memberId) {
        const loans = DataManager.getMemberLoans(memberId);
        return loans.reduce((sum, l) => sum + parseFloat(l.principal), 0);
    },

    /**
     * Calculate total guarantees for a member
     * 
     * @param {string} memberId - Member ID
     * @returns {number} Total guarantee value
     */
    getMemberTotalGuarantees(memberId) {
        const guarantees = DataManager.getMemberGuarantees(memberId);
        return guarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);
    },

    /**
     * Get global statistics
     * 
     * @returns {object} Global statistics
     */
    getGlobalStats() {
        const members = DataManager.getMembers();
        const deposits = DataManager.getDeposits();
        const loans = DataManager.getLoans();
        const guarantees = DataManager.getGuarantees();

        const totalDeposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const totalLoans = loans.reduce((sum, l) => sum + parseFloat(l.principal), 0);
        const totalGuarantees = guarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);
        const totalInterest = loans.reduce((sum, l) => sum + parseFloat(l.totalInterest || 0), 0);

        const activeLoans = loans.filter(l => l.status === 'active').length;
        const paidLoans = loans.filter(l => l.status === 'paid').length;

        return {
            totalMembers: members.length,
            totalDeposits: Math.round(totalDeposits * 100) / 100,
            totalLoans: Math.round(totalLoans * 100) / 100,
            totalGuarantees: Math.round(totalGuarantees * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            activeLoans: activeLoans,
            paidLoans: paidLoans
        };
    },

    /**
     * Get per-member statistics
     * 
     * @returns {array} Array of member statistics
     */
    getMemberStats() {
        const members = DataManager.getMembers();

        return members.map(member => {
            const deposits = this.getMemberTotalDeposits(member.id);
            const loans = this.getMemberTotalLoans(member.id);
            const guarantees = this.getMemberTotalGuarantees(member.id);

            return {
                id: member.id,
                name: `${member.firstName} ${member.lastName}`,
                deposits: Math.round(deposits * 100) / 100,
                loans: Math.round(loans * 100) / 100,
                guarantees: Math.round(guarantees * 100) / 100,
                balance: Math.round((deposits - loans) * 100) / 100
            };
        });
    },

    /**
     * Format currency in FCFA
     * 
     * @param {number} amount - Amount to format
     * @returns {string} Formatted amount
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format date
     * 
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    /**
     * Format date short
     * 
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    },

    /**
     * Calculate loan progress percentage
     * 
     * @param {object} loan - Loan object
     * @returns {number} Progress percentage
     */
    getLoanProgress(loan) {
        if (!loan.totalAmount || loan.totalAmount === 0) return 0;
        const progress = (loan.paidAmount / loan.totalAmount) * 100;
        return Math.round(progress * 100) / 100;
    },

    /**
     * Get guarantee coverage ratio
     * 
     * @param {string} loanId - Loan ID
     * @returns {number} Coverage ratio percentage
     */
    getGuaranteeCoverageRatio(loanId) {
        const loan = DataManager.getLoan(loanId);
        if (!loan) return 0;

        const guarantees = DataManager.getLoanGuarantees(loanId);
        const totalGuaranteeValue = guarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);

        if (loan.principal === 0) return 0;

        const ratio = (totalGuaranteeValue / loan.principal) * 100;
        return Math.round(ratio * 100) / 100;
    }
};
