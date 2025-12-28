const BLOCKED_KEYWORDS = [
  'diagnose',
  'diagnosis',
  'treat',
  'treatment',
  'prescribe',
  'prescription',
  'medication',
  'medicine',
  'drug',
  'cure',
  'therapy',
  'you have',
  'you should take',
  'you need to',
  'you must',
  'take this',
  'use this medication'
];

const DISCLAIMER = `⚠️ IMPORTANT DISCLAIMER

This explanation is for educational purposes only. It does not diagnose conditions or recommend treatments. Always consult your healthcare provider to discuss your results.

✓ Always discuss your results with your healthcare provider
✓ Seek immediate care for urgent symptoms

✗ This tool does NOT diagnose medical conditions
✗ This tool does NOT recommend treatments
✗ This tool does NOT replace your doctor's judgment

---

`;

function enforceSafety(aiResponse) {
  if (!aiResponse || typeof aiResponse !== 'string') {
    return DISCLAIMER + 'Unable to generate explanation. Please try again.';
  }

  let sanitized = aiResponse;

  // Check for blocked keywords (case-insensitive)
  const lowerResponse = sanitized.toLowerCase();
  const foundKeywords = BLOCKED_KEYWORDS.filter(keyword =>
    lowerResponse.includes(keyword.toLowerCase())
  );

  if (foundKeywords.length > 0) {
    console.warn('Safety guardrails triggered. Found keywords:', foundKeywords);
    
    // Remove or replace problematic phrases
    foundKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '[removed for safety]');
    });

    // Log for review
    console.log('Sanitized response:', sanitized.substring(0, 200));
  }

  // Ensure disclaimer is at the beginning
  if (!sanitized.startsWith('⚠️') && !sanitized.startsWith(DISCLAIMER.trim().substring(0, 10))) {
    sanitized = DISCLAIMER + sanitized;
  }

  // Additional safety checks
  // Remove any sentences that sound like prescriptions
  const prescriptionPatterns = [
    /you should (take|use|start|stop)/gi,
    /you need to (take|use|start|stop)/gi,
    /I recommend (taking|using)/gi,
    /you must (take|use)/gi
  ];

  prescriptionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[removed - consult your doctor]');
  });

  return sanitized;
}

module.exports = enforceSafety;

