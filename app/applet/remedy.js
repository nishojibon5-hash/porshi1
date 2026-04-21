
const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// Line 3804 is index 3803
// Line 3812 is index 3811
const start = 3803;
const end = 3811;

const replacement = `        } else {
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

lines.splice(start, end - start + 1, replacement);
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed App.tsx structural corruption');
