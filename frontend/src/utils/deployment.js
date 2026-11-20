// Ohne Vite (z. B. bei direkten Node-Tests) gilt der reguläre App-Modus.
export const isPortfolio = typeof __AZUBIPREP_PORTFOLIO__ !== 'undefined' && __AZUBIPREP_PORTFOLIO__;
