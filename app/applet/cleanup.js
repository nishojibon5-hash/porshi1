
const fs = require('fs');
const filePath = '/app/applet/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `          addLog('লগইন প্রয়োজন (No Active User)');
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

const fixed = content.replace(/.*ইউজা.*else.*/, replacement);
fs.writeFileSync(filePath, fixed);
console.log('Done cleaning up App.tsx');
