/* eslint-disable */
module.exports = {
  session: {
    create: true,
  },
  account: {
    create: true,
    update: true,
    destroy: true,
    find: true,
    resetPassword: true,
    activate2fa: true,
    reset2fa: true,
    deactivate2fa: true,
    validateResetPasswordToken: true,
  },
  sites: {
    find: true,
    all: true,
    create: true,
    update: true,
    destroy: true,
    duplicate: true,
  },
  siteSubscription: {
    create: true,
    simulate: true,
    validate: true,
  },
  accountSubscription: {
    create: true,
    simulate: true,
    validate: true,
  },
  sitePlans: {
    all: true,
  },
  accountPlans: {
    all: true,
  },
  perSitePricingBillingProfiles: {
    all: true,
    find: true,
    updateCreditCard: true,
    updateInfo: true,
  },
  perAccountPricingBillingProfile: {
    find: true,
    updateCreditCard: true,
    updateInfo: true,
  },
  invoice: {
    perAccountPricingBillingProfileInstances: true,
    perSitePricingBillingProfileInstances: true,
    perAccountPricingBillingProfileCollectUnpaid: true,
    perSitePricingBillingProfileCollectUnpaid: true,
  },
  resourceUsages: {
    all: true,
  },
  jobResult: {
    find: true,
  },
  siteTransfers: {
    all: true,
    find: true,
    create: true,
    destroy: true,
    simulateAccept: true,
    accept: true,
    decline: true,
  },
  siteInvitation: {
    redeem: true,
  },
  subscriptionLimits: {
    all: true,
  },
  subscriptionFeatures: {
    all: true,
  },
};
