/* eslint-disable */
module.exports = {
  "session": {
    "create": true
  },
  "account": {
    "create": true,
    "update": true,
    "destroy": true,
    "find": true,
    "resetPassword": true,
    "activate2fa": true
  },
  "sites": {
    "find": true,
    "all": true,
    "create": true,
    "update": true,
    "destroy": true,
    "duplicate": true
  },
  "subscription": {
    "create": true,
    "simulate": true,
    "validate": true
  },
  "plans": {
    "all": true
  },
  "jobResult": {
    "find": true
  },
  "siteTransfers": {
    "all": true,
    "find": true,
    "create": true,
    "destroy": true,
    "simulateAccept": true,
    "accept": true,
    "decline": true
  },
  "siteInvitation": {
    "redeem": true
  },
  "subscriptionLimits": {
    "all": true
  },
  "subscriptionFeatures": {
    "all": true
  }
};