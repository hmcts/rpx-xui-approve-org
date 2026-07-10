type DecisionScenario = {
  idSuffix: string;
  decisionLabel: string | RegExp;
  expectedMethod: 'PUT' | 'DELETE';
  expectedStatus?: 'ACTIVE' | 'REVIEW';
  successBannerText: RegExp;
};

export const decisionScenarios: DecisionScenario[] = [
  {
    idSuffix: 'approve',
    decisionLabel: 'Approve it',
    expectedMethod: 'PUT',
    expectedStatus: 'ACTIVE',
    successBannerText: /Registration approved/i
  },
  {
    idSuffix: 'reject',
    decisionLabel: 'Reject it',
    expectedMethod: 'DELETE',
    successBannerText: /Registration rejected/i
  },
  {
    idSuffix: 'review',
    decisionLabel: /Place registration under review/i,
    expectedMethod: 'PUT',
    expectedStatus: 'REVIEW',
    successBannerText: /Registration put under review/i
  }
];
