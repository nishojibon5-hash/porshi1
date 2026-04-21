
const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const corruptedIndex = lines.findIndex(line => line.includes("ইউজা"));

if (corruptedIndex !== -1) {
  console.log(`Found corrupted line at index \${corruptedIndex + 1}`);
  
  const correctClosure = `        } else {
          addLog('লগইন প্রয়োজন (No Active User)');
          setUser(null);
          setIsAuthReady(true);
          setIsAuthLoading(false);
        }
      } catch (error) {
        console.error('Auth Listener Error:', error);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setErrorMessage(null);
    const email = \`\${authPhone.trim()}@porshi.com\`;
    const password = authPassword;

    try {
      if (authView === 'register') {
        addLog(\`রেজিস্ট্রেশন চেষ্টা: \${authPhone.trim()}\`);
        setAuthProcessingStep('নতুন অ্যাকাউন্ট তৈরি হচ্ছে...');
        registrationData.current = { name: authName, phone: authPhone.trim() };
        await createUserWithEmailAndPassword(auth, email, password);
        addLog('সার্ভার রেসপন্স: সাকসেস (Registered)');
        setAuthSuccessMessage('নিবন্ধন সফল!');
        setShowAuthModal(false);
      } else {`;

  const loginIndex = lines.findIndex(line => line.includes("লগইন চেষ্টা:") && line.includes("authPhone.trim()"));
  
  if (loginIndex !== -1) {
    console.log(`Found login attempt line at index \${loginIndex + 1}`);
    lines.splice(corruptedIndex - 1, loginIndex - (corruptedIndex - 1), correctClosure);
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully fixed App.tsx');
  } else {
    console.log('Could not find login attempt line');
  }
} else {
  console.log('Could not find corrupted line');
}
