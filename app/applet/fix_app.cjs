
const fs = require('fs');
const path = require('path');

const filePath = '/app/applet/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Target the corrupted line 3805 (approx)
// We look for the "ইউজা" string which is unique
const targetStr = "addLog('ইউজা";
const lines = content.split('\n');
const newLines = [];
let found = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(targetStr) && !found) {
        found = true;
        // Replace with the correct logic
        newLines.push("          addLog('লগইন প্রয়োজন (No Active User)');");
        newLines.push("          setUser(null);");
        newLines.push("          setIsAuthReady(true);");
        newLines.push("          setIsAuthLoading(false);");
        newLines.push("        }");
        newLines.push("      } catch (error) {");
        newLines.push("        console.error('Auth Listener Error:', error);");
        newLines.push("        setIsAuthReady(true);");
        newLines.push("      }");
        newLines.push("    });");
        newLines.push("");
        newLines.push("    return () => {");
        newLines.push("      unsubscribe();");
        newLines.push("      if (userUnsubscribe) userUnsubscribe();");
        newLines.push("    };");
        newLines.push("  }, []);");
        newLines.push("");
        newLines.push("  const handleEmailAuth = async (e: React.FormEvent) => {");
        newLines.push("    e.preventDefault();");
        newLines.push("    setIsAuthLoading(true);");
        newLines.push("    setErrorMessage(null);");
        newLines.push("    const email = `${authPhone.trim()}@porshi.com`;");
        newLines.push("    const password = authPassword;");
        newLines.push("");
        newLines.push("    try {");
        newLines.push("      if (authView === 'register') {");
        newLines.push("        addLog(`রেজিস্ট্রেশন চেষ্টা: ${authPhone.trim()}`);");
        newLines.push("        setAuthProcessingStep('নতুন অ্যাকাউন্ট তৈরি হচ্ছে...');");
        newLines.push("        registrationData.current = { name: authName, phone: authPhone.trim() };");
        newLines.push("        await createUserWithEmailAndPassword(auth, email, password);");
        newLines.push("        addLog('সার্ভার রেসপন্স: সাকসেস (Registered)');");
        newLines.push("        setAuthSuccessMessage('নিবন্ধন সফল!');");
        newLines.push("        setShowAuthModal(false);");
        newLines.push("      } else {");
    } else {
        newLines.push(lines[i]);
    }
}

if (found) {
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Successfully fixed App.tsx corruption');
} else {
    console.log('Corruption string not found');
}
