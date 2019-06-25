/* eslint-disable */
module.exports = {
  "session": {
    "create": true
  },
  "account": {
    "create": true,
    "update": true,
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
    "validate": true
  },
  "siteTransfers": {
    "all": true,
    "find": true,
    "create": true,
    "destroy": true,
    "accept": true,
    "decline": true
  },
  "siteInvitation": {
    "redeem": true
  }
};