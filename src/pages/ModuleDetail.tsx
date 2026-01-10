import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Layout,
    Server,
    Database,
    ExternalLink,
    Play,
    FileText,
    BookOpen,
    CheckCircle2,
    Lock,
    ArrowRight,
    Trophy,
    XCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Quiz questions for each subheading
interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface Subheading {
    id: string;
    name: string;
    description: string;
    youtubeLinks: { title: string; url: string }[];
    documentLinks: { title: string; url: string }[];
    quiz: QuizQuestion[];
}

// Module definitions with their subheadings and content
const MODULE_DATA: Record<string, {
    name: string;
    icon: typeof Layout;
    gradient: string;
    bgColor: string;
    subheadings: Subheading[];
}> = {
    frontend: {
        name: 'Frontend Development',
        icon: Layout,
        gradient: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500',
        subheadings: [
            {
                id: 'html',
                name: 'HTML',
                description: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display content.',
                youtubeLinks: [
                    { title: 'HTML Full Course - Build a Website Tutorial', url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg' },
                    { title: 'HTML Crash Course For Beginners', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE' },
                    { title: 'Learn HTML in 1 Hour', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
                ],
                documentLinks: [
                    { title: 'MDN Web Docs - HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
                    { title: 'W3Schools HTML Tutorial', url: 'https://www.w3schools.com/html/' },
                    { title: 'HTML.com - Learn HTML', url: 'https://html.com/' },
                ],
                quiz: [
                    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Multi Language'], correctAnswer: 0 },
                    { question: 'Which HTML tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], correctAnswer: 2 },
                    { question: 'Which tag is used to create a hyperlink?', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: 1 },
                ],
            },
            {
                id: 'css',
                name: 'CSS',
                description: 'CSS (Cascading Style Sheets) is used to style and layout web pages. It controls colors, fonts, spacing, positioning, and responsive design, making websites visually appealing.',
                youtubeLinks: [
                    { title: 'CSS Tutorial - Zero to Hero', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc' },
                    { title: 'CSS Crash Course For Beginners', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI' },
                    { title: 'Learn Flexbox in 15 Minutes', url: 'https://www.youtube.com/watch?v=fYq5PXgSsbE' },
                ],
                documentLinks: [
                    { title: 'MDN Web Docs - CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
                    { title: 'CSS-Tricks', url: 'https://css-tricks.com/' },
                    { title: 'W3Schools CSS Tutorial', url: 'https://www.w3schools.com/css/' },
                ],
                quiz: [
                    { question: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correctAnswer: 1 },
                    { question: 'Which property is used to change text color?', options: ['text-color', 'font-color', 'color', 'foreground'], correctAnswer: 2 },
                    { question: 'Which CSS property controls the space between elements?', options: ['spacing', 'margin', 'padding', 'Both margin and padding'], correctAnswer: 3 },
                ],
            },
            {
                id: 'javascript',
                name: 'JavaScript',
                description: 'JavaScript is the programming language of the web. It enables interactive web pages, handles user events, manipulates the DOM, and powers modern web applications.',
                youtubeLinks: [
                    { title: 'JavaScript Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
                    { title: 'JavaScript Crash Course', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c' },
                    { title: 'Learn JavaScript in 1 Hour', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
                ],
                documentLinks: [
                    { title: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
                    { title: 'JavaScript.info', url: 'https://javascript.info/' },
                    { title: 'Eloquent JavaScript (Free Book)', url: 'https://eloquentjavascript.net/' },
                ],
                quiz: [
                    { question: 'Which keyword is used to declare a variable in modern JavaScript?', options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 3 },
                    { question: 'What is the output of typeof null?', options: ['null', 'undefined', 'object', 'boolean'], correctAnswer: 2 },
                    { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctAnswer: 0 },
                ],
            },
            {
                id: 'react',
                name: 'React',
                description: 'React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering of dynamic web applications.',
                youtubeLinks: [
                    { title: 'React Course - Beginner Tutorial', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
                    { title: 'React JS Crash Course', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
                    { title: 'Full React Tutorial', url: 'https://www.youtube.com/watch?v=j942wKiXFu8' },
                ],
                documentLinks: [
                    { title: 'React Official Docs', url: 'https://react.dev/' },
                    { title: 'React Tutorial - W3Schools', url: 'https://www.w3schools.com/react/' },
                    { title: 'React Patterns', url: 'https://reactpatterns.com/' },
                ],
                quiz: [
                    { question: 'What is React?', options: ['A database', 'A JavaScript library for building UIs', 'A programming language', 'A CSS framework'], correctAnswer: 1 },
                    { question: 'What is used to pass data from parent to child in React?', options: ['state', 'props', 'refs', 'context'], correctAnswer: 1 },
                    { question: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 1 },
                ],
            },
            {
                id: 'typescript',
                name: 'TypeScript',
                description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static types, interfaces, and advanced features for building large-scale applications.',
                youtubeLinks: [
                    { title: 'TypeScript Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs' },
                    { title: 'TypeScript Crash Course', url: 'https://www.youtube.com/watch?v=BCg4U1FzODs' },
                    { title: 'Learn TypeScript in 50 Minutes', url: 'https://www.youtube.com/watch?v=WBPrJSw7yQA' },
                ],
                documentLinks: [
                    { title: 'TypeScript Official Docs', url: 'https://www.typescriptlang.org/docs/' },
                    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/' },
                    { title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/' },
                ],
                quiz: [
                    { question: 'TypeScript is a superset of which language?', options: ['Python', 'Java', 'JavaScript', 'C++'], correctAnswer: 2 },
                    { question: 'What is the file extension for TypeScript files?', options: ['.js', '.ts', '.tsx', 'Both .ts and .tsx'], correctAnswer: 3 },
                    { question: 'Which TypeScript feature adds type safety?', options: ['Classes', 'Interfaces', 'Static typing', 'All of the above'], correctAnswer: 3 },
                ],
            },
        ],
    },
    backend: {
        name: 'Backend Development',
        icon: Server,
        gradient: 'from-violet-500 to-purple-500',
        bgColor: 'bg-violet-500',
        subheadings: [
            {
                id: 'nodejs',
                name: 'Node.js',
                description: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on the server side, enabling full-stack JavaScript development.',
                youtubeLinks: [
                    { title: 'Node.js Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4' },
                    { title: 'Node.js Crash Course', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4' },
                    { title: 'Learn Node.js - Full Tutorial', url: 'https://www.youtube.com/watch?v=RLtyhwFtXQA' },
                ],
                documentLinks: [
                    { title: 'Node.js Official Docs', url: 'https://nodejs.org/docs/' },
                    { title: 'Node.js Tutorial - W3Schools', url: 'https://www.w3schools.com/nodejs/' },
                    { title: 'The Node.js Handbook', url: 'https://www.freecodecamp.org/news/the-definitive-node-js-handbook/' },
                ],
                quiz: [
                    { question: 'Node.js is built on which JavaScript engine?', options: ['SpiderMonkey', 'V8', 'Chakra', 'JavaScriptCore'], correctAnswer: 1 },
                    { question: 'Which command initializes a new Node.js project?', options: ['node init', 'npm init', 'node start', 'npm start'], correctAnswer: 1 },
                    { question: 'Node.js is typically used for?', options: ['Frontend only', 'Backend/server-side', 'Mobile apps only', 'Desktop apps only'], correctAnswer: 1 },
                ],
            },
            {
                id: 'express',
                name: 'Express.js',
                description: 'Express.js is a minimal and flexible Node.js web application framework. It provides robust features for building web and mobile applications with APIs.',
                youtubeLinks: [
                    { title: 'Express.js Crash Course', url: 'https://www.youtube.com/watch?v=L72fhGm1tfE' },
                    { title: 'Build REST API with Express', url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48' },
                    { title: 'Express Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=SccSCuHhOw0' },
                ],
                documentLinks: [
                    { title: 'Express.js Official Docs', url: 'https://expressjs.com/' },
                    { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html' },
                    { title: 'MDN Express Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs' },
                ],
                quiz: [
                    { question: 'Express.js is a framework for?', options: ['React', 'Node.js', 'Python', 'Java'], correctAnswer: 1 },
                    { question: 'Which method handles GET requests in Express?', options: ['app.get()', 'app.post()', 'app.fetch()', 'app.request()'], correctAnswer: 0 },
                    { question: 'Middleware in Express is used to?', options: ['Style pages', 'Process requests between server and routes', 'Create databases', 'None of the above'], correctAnswer: 1 },
                ],
            },
            {
                id: 'apis',
                name: 'REST APIs',
                description: 'REST (Representational State Transfer) APIs are architectural patterns for building scalable web services. Learn to design, build, and consume RESTful APIs.',
                youtubeLinks: [
                    { title: 'REST API Tutorial', url: 'https://www.youtube.com/watch?v=SLwpqD8n3d0' },
                    { title: 'Build a REST API with Node.js', url: 'https://www.youtube.com/watch?v=0oXYLzuucwE' },
                    { title: 'RESTful APIs Explained', url: 'https://www.youtube.com/watch?v=Q-BpqyOT3a8' },
                ],
                documentLinks: [
                    { title: 'REST API Tutorial', url: 'https://restfulapi.net/' },
                    { title: 'REST API Design Best Practices', url: 'https://blog.postman.com/rest-api-design-best-practices/' },
                    { title: 'HTTP Methods for REST', url: 'https://restfulapi.net/http-methods/' },
                ],
                quiz: [
                    { question: 'What does REST stand for?', options: ['Representational State Transfer', 'Request State Transfer', 'Remote State Transfer', 'Representational Server Transfer'], correctAnswer: 0 },
                    { question: 'Which HTTP method is used to update a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 2 },
                    { question: 'What status code indicates success?', options: ['404', '500', '200', '401'], correctAnswer: 2 },
                ],
            },
            {
                id: 'authentication',
                name: 'Authentication',
                description: 'Authentication verifies user identity. Learn JWT tokens, OAuth, session-based auth, and security best practices for protecting your applications.',
                youtubeLinks: [
                    { title: 'JWT Authentication Tutorial', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4' },
                    { title: 'Node.js Auth with JWT', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM' },
                    { title: 'OAuth 2.0 Explained', url: 'https://www.youtube.com/watch?v=CPbvxxslDTU' },
                ],
                documentLinks: [
                    { title: 'JWT.io Introduction', url: 'https://jwt.io/introduction' },
                    { title: 'Auth0 Docs', url: 'https://auth0.com/docs/' },
                    { title: 'OWASP Authentication Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
                ],
                quiz: [
                    { question: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Token', 'Java Wireless Token'], correctAnswer: 1 },
                    { question: 'Which part of JWT contains the payload?', options: ['Header', 'Body', 'Signature', 'Footer'], correctAnswer: 1 },
                    { question: 'OAuth is primarily used for?', options: ['Data storage', 'Authorization', 'Styling', 'Database management'], correctAnswer: 1 },
                ],
            },
        ],
    },
    database: {
        name: 'Database',
        icon: Database,
        gradient: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500',
        subheadings: [
            {
                id: 'sql',
                name: 'SQL Basics',
                description: 'SQL (Structured Query Language) is the standard language for relational database management. Learn to create, read, update, and delete data efficiently.',
                youtubeLinks: [
                    { title: 'SQL Tutorial - Full Course', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
                    { title: 'SQL for Beginners', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA' },
                    { title: 'Learn SQL in 1 Hour', url: 'https://www.youtube.com/watch?v=9Pzj7Aj25lw' },
                ],
                documentLinks: [
                    { title: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/' },
                    { title: 'SQLBolt - Interactive SQL', url: 'https://sqlbolt.com/' },
                    { title: 'SQL Tutorial - Mode', url: 'https://mode.com/sql-tutorial/' },
                ],
                quiz: [
                    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'], correctAnswer: 0 },
                    { question: 'Which SQL command retrieves data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 2 },
                    { question: 'Which clause filters rows in SQL?', options: ['ORDER BY', 'WHERE', 'GROUP BY', 'HAVING'], correctAnswer: 1 },
                ],
            },
            {
                id: 'postgresql',
                name: 'PostgreSQL',
                description: 'PostgreSQL is a powerful, open-source relational database system. It supports advanced data types, full-text search, and JSON operations.',
                youtubeLinks: [
                    { title: 'PostgreSQL Tutorial', url: 'https://www.youtube.com/watch?v=qw--VYLpxG4' },
                    { title: 'Learn PostgreSQL', url: 'https://www.youtube.com/watch?v=SpfIwlAYaKk' },
                    { title: 'PostgreSQL Crash Course', url: 'https://www.youtube.com/watch?v=zw4s3Ey8ayo' },
                ],
                documentLinks: [
                    { title: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/' },
                    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/' },
                    { title: 'Supabase PostgreSQL Guide', url: 'https://supabase.com/docs/guides/database' },
                ],
                quiz: [
                    { question: 'PostgreSQL is what type of database?', options: ['NoSQL', 'Relational', 'Graph', 'Document'], correctAnswer: 1 },
                    { question: 'PostgreSQL supports which data format natively?', options: ['XML only', 'JSON', 'CSV only', 'Binary only'], correctAnswer: 1 },
                    { question: 'Which command creates a new database in PostgreSQL?', options: ['CREATE DATABASE', 'NEW DATABASE', 'MAKE DATABASE', 'ADD DATABASE'], correctAnswer: 0 },
                ],
            },
            {
                id: 'mongodb',
                name: 'MongoDB',
                description: 'MongoDB is a document-oriented NoSQL database. It stores data in flexible, JSON-like documents, making it ideal for modern application development.',
                youtubeLinks: [
                    { title: 'MongoDB Crash Course', url: 'https://www.youtube.com/watch?v=-56x56UppqQ' },
                    { title: 'MongoDB Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=ofme2o29ngU' },
                    { title: 'Learn MongoDB in 1 Hour', url: 'https://www.youtube.com/watch?v=c2M-rlkkT5o' },
                ],
                documentLinks: [
                    { title: 'MongoDB Official Docs', url: 'https://www.mongodb.com/docs/' },
                    { title: 'MongoDB University', url: 'https://university.mongodb.com/' },
                    { title: 'MongoDB Tutorial - W3Schools', url: 'https://www.w3schools.com/mongodb/' },
                ],
                quiz: [
                    { question: 'MongoDB is what type of database?', options: ['Relational', 'NoSQL/Document', 'Graph', 'Key-Value'], correctAnswer: 1 },
                    { question: 'MongoDB stores data in what format?', options: ['Tables', 'Documents (BSON)', 'Rows', 'Columns'], correctAnswer: 1 },
                    { question: 'What is a collection in MongoDB?', options: ['A database', 'A group of documents', 'A query', 'An index'], correctAnswer: 1 },
                ],
            },
            {
                id: 'orm',
                name: 'ORMs & Prisma',
                description: 'Object-Relational Mapping (ORM) tools like Prisma simplify database operations. Learn to interact with databases using type-safe queries.',
                youtubeLinks: [
                    { title: 'Prisma Crash Course', url: 'https://www.youtube.com/watch?v=RebA5J-rlwg' },
                    { title: 'Prisma Tutorial', url: 'https://www.youtube.com/watch?v=CYH04BJzamo' },
                    { title: 'Learn Prisma in 60 Minutes', url: 'https://www.youtube.com/watch?v=rLRIB6AF2Dg' },
                ],
                documentLinks: [
                    { title: 'Prisma Official Docs', url: 'https://www.prisma.io/docs' },
                    { title: 'Prisma Getting Started', url: 'https://www.prisma.io/docs/getting-started' },
                    { title: 'Prisma with Next.js', url: 'https://www.prisma.io/nextjs' },
                ],
                quiz: [
                    { question: 'What does ORM stand for?', options: ['Object Relational Mapping', 'Object Resource Management', 'Open Relational Model', 'Object Request Model'], correctAnswer: 0 },
                    { question: 'Prisma provides type-safe database access for?', options: ['Python only', 'JavaScript/TypeScript', 'Java only', 'Ruby only'], correctAnswer: 1 },
                    { question: 'What file defines your database schema in Prisma?', options: ['schema.json', 'prisma.config', 'schema.prisma', 'database.prisma'], correctAnswer: 2 },
                ],
            },
        ],
    },
};

const NEXT_MODULE: Record<string, string> = {
    frontend: 'backend',
    backend: 'database',
    database: '',
};

export default function ModuleDetail() {
    const { roadmapId, moduleId } = useParams<{ roadmapId: string; moduleId: string }>();
    const navigate = useNavigate();
    const [activeSubheading, setActiveSubheading] = useState<string>('');
    const [completedSubheadings, setCompletedSubheadings] = useState<string[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

    const moduleData = MODULE_DATA[moduleId as keyof typeof MODULE_DATA];

    useEffect(() => {
        // Load completed subheadings from localStorage
        const saved = localStorage.getItem(`module_${moduleId}_completed`);
        if (saved) {
            setCompletedSubheadings(JSON.parse(saved));
        }

        if (moduleData && moduleData.subheadings.length > 0) {
            setActiveSubheading(moduleData.subheadings[0].id);
        }
    }, [moduleId]);

    const saveProgress = (newCompleted: string[]) => {
        localStorage.setItem(`module_${moduleId}_completed`, JSON.stringify(newCompleted));
        setCompletedSubheadings(newCompleted);
    };

    if (!moduleData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Module not found</p>
            </div>
        );
    }

    const activeContent = moduleData.subheadings.find(s => s.id === activeSubheading);
    const ModuleIcon = moduleData.icon;
    const activeIndex = moduleData.subheadings.findIndex(s => s.id === activeSubheading);
    const isSubheadingLocked = (index: number) => {
        if (index === 0) return false;
        const prevSubheading = moduleData.subheadings[index - 1];
        return !completedSubheadings.includes(prevSubheading.id);
    };
    const isCurrentCompleted = completedSubheadings.includes(activeSubheading);
    const allSubheadingsCompleted = moduleData.subheadings.every(s => completedSubheadings.includes(s.id));
    const progressPercentage = Math.round((completedSubheadings.length / moduleData.subheadings.length) * 100);

    const handleSubheadingClick = (subheadingId: string, index: number) => {
        if (isSubheadingLocked(index)) {
            toast.error('Complete the previous topic first!');
            return;
        }
        setActiveSubheading(subheadingId);
        setShowQuiz(false);
        setQuizCompleted(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setQuizScore(0);
        setAnsweredQuestions([]);
    };

    const handleStartQuiz = () => {
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setQuizScore(0);
        setQuizCompleted(false);
        setAnsweredQuestions(new Array(activeContent?.quiz.length || 0).fill(false));
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (answeredQuestions[currentQuestionIndex]) return;
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        if (selectedAnswer === null || !activeContent) return;

        const isCorrect = selectedAnswer === activeContent.quiz[currentQuestionIndex].correctAnswer;
        const newAnswered = [...answeredQuestions];
        newAnswered[currentQuestionIndex] = true;
        setAnsweredQuestions(newAnswered);

        if (isCorrect) {
            setQuizScore(prev => prev + 1);
        }

        if (currentQuestionIndex < activeContent.quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            // Quiz completed
            const finalScore = isCorrect ? quizScore + 1 : quizScore;
            const passingScore = Math.ceil(activeContent.quiz.length * 0.6); // 60% to pass

            if (finalScore >= passingScore) {
                // Mark as completed
                const newCompleted = [...completedSubheadings, activeSubheading];
                saveProgress(newCompleted);
                toast.success('🎉 Topic completed! You passed the quiz!');
            } else {
                toast.error('You need 60% to pass. Try again!');
            }
            setQuizCompleted(true);
        }
    };

    const handleNextModule = () => {
        const nextModuleId = NEXT_MODULE[moduleId as string];
        if (nextModuleId) {
            navigate(`/roadmap/${roadmapId}/module/${nextModuleId}`);
        } else {
            navigate('/dashboard');
            toast.success('🎉 Congratulations! You completed the Full-Stack roadmap!');
        }
    };

    const handleMoveToNextSubheading = () => {
        if (activeIndex < moduleData.subheadings.length - 1) {
            const nextSubheading = moduleData.subheadings[activeIndex + 1];
            setActiveSubheading(nextSubheading.id);
            setShowQuiz(false);
            setQuizCompleted(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setQuizScore(0);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed Header with Navigation */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
                {/* Top Bar */}
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard')}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Roadmap
                            </Button>
                            <div className="hidden sm:flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${moduleData.bgColor}/10`}>
                                    <ModuleIcon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">{moduleData.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
                            <div className="w-24">
                                <Progress value={progressPercentage} className="h-2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizontal Subheading Navigation */}
                <div className="border-t border-border/50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
                            {moduleData.subheadings.map((subheading, index) => {
                                const isLocked = isSubheadingLocked(index);
                                const isCompleted = completedSubheadings.includes(subheading.id);
                                const isActive = activeSubheading === subheading.id;

                                return (
                                    <button
                                        key={subheading.id}
                                        onClick={() => handleSubheadingClick(subheading.id, index)}
                                        disabled={isLocked}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${isActive
                                                ? `bg-gradient-to-r ${moduleData.gradient} text-white shadow-lg`
                                                : isLocked
                                                    ? 'text-muted-foreground/50 cursor-not-allowed'
                                                    : isCompleted
                                                        ? 'text-success bg-success/10'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                            }`}
                                    >
                                        {isLocked && <Lock className="w-3 h-3" />}
                                        {isCompleted && !isActive && <CheckCircle2 className="w-3 h-3" />}
                                        {subheading.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {activeContent && !showQuiz && (
                        <motion.div
                            key={`content-${activeSubheading}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto"
                        >
                            {/* Content Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <h1 className="font-display text-3xl md:text-4xl font-bold">
                                        {activeContent.name}
                                    </h1>
                                    {isCurrentCompleted && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-full">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {activeContent.description}
                                </p>
                            </div>

                            {/* Resources Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* YouTube Videos */}
                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-red-500/10">
                                            <Play className="w-5 h-5 text-red-500" />
                                        </div>
                                        <h2 className="font-display font-semibold text-lg">Video Tutorials</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {activeContent.youtubeLinks.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Play className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="text-sm font-medium flex-1 line-clamp-2">{link.title}</span>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Documentation Links */}
                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <h2 className="font-display font-semibold text-lg">Documentation & Guides</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {activeContent.documentLinks.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-sm font-medium flex-1 line-clamp-2">{link.title}</span>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Take Quiz Button */}
                            {!isCurrentCompleted && (
                                <div className="text-center">
                                    <Button
                                        size="lg"
                                        onClick={handleStartQuiz}
                                        className={`gap-2 bg-gradient-to-r ${moduleData.gradient} hover:opacity-90`}
                                    >
                                        Take Quiz to Complete
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Pass the quiz to unlock the next topic
                                    </p>
                                </div>
                            )}

                            {/* Already Completed - Next Actions */}
                            {isCurrentCompleted && (
                                <div className="text-center space-y-4">
                                    {activeIndex < moduleData.subheadings.length - 1 ? (
                                        <Button
                                            size="lg"
                                            onClick={handleMoveToNextSubheading}
                                            className="gap-2"
                                        >
                                            Continue to {moduleData.subheadings[activeIndex + 1].name}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    ) : allSubheadingsCompleted ? (
                                        <Button
                                            size="lg"
                                            onClick={handleNextModule}
                                            className={`gap-2 bg-gradient-to-r ${moduleData.gradient}`}
                                        >
                                            {NEXT_MODULE[moduleId as string] ? `Go to ${MODULE_DATA[NEXT_MODULE[moduleId as string]]?.name}` : 'Complete Roadmap'}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Quiz Section */}
                    {showQuiz && activeContent && (
                        <motion.div
                            key={`quiz-${activeSubheading}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-2xl mx-auto"
                        >
                            {!quizCompleted ? (
                                <div className="glass-card p-8 rounded-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-display text-xl font-semibold">{activeContent.name} Quiz</h2>
                                        <span className="text-sm text-muted-foreground">
                                            Question {currentQuestionIndex + 1} of {activeContent.quiz.length}
                                        </span>
                                    </div>

                                    <Progress
                                        value={((currentQuestionIndex + 1) / activeContent.quiz.length) * 100}
                                        className="h-2 mb-8"
                                    />

                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-6">
                                            {activeContent.quiz[currentQuestionIndex].question}
                                        </h3>

                                        <div className="space-y-3">
                                            {activeContent.quiz[currentQuestionIndex].options.map((option, index) => {
                                                const isSelected = selectedAnswer === index;
                                                const isCorrect = index === activeContent.quiz[currentQuestionIndex].correctAnswer;
                                                const isAnswered = answeredQuestions[currentQuestionIndex];

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleAnswerSelect(index)}
                                                        disabled={isAnswered}
                                                        className={`w-full p-4 rounded-xl border text-left transition-all ${isAnswered
                                                                ? isCorrect
                                                                    ? 'border-success bg-success/10 text-success'
                                                                    : isSelected
                                                                        ? 'border-destructive bg-destructive/10 text-destructive'
                                                                        : 'border-border opacity-50'
                                                                : isSelected
                                                                    ? `border-2 border-primary bg-primary/10`
                                                                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isAnswered && isCorrect
                                                                    ? 'bg-success text-white'
                                                                    : isAnswered && isSelected && !isCorrect
                                                                        ? 'bg-destructive text-white'
                                                                        : isSelected
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'bg-secondary'
                                                                }`}>
                                                                {isAnswered && isCorrect ? (
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                ) : isAnswered && isSelected && !isCorrect ? (
                                                                    <XCircle className="w-4 h-4" />
                                                                ) : (
                                                                    String.fromCharCode(65 + index)
                                                                )}
                                                            </span>
                                                            <span className="font-medium">{option}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="ghost" onClick={() => setShowQuiz(false)}>
                                            Back to Content
                                        </Button>
                                        <Button
                                            onClick={handleNextQuestion}
                                            disabled={selectedAnswer === null}
                                            className="gap-2"
                                        >
                                            {currentQuestionIndex < activeContent.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card p-8 rounded-2xl text-center">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${quizScore >= Math.ceil(activeContent.quiz.length * 0.6)
                                            ? 'bg-success/10'
                                            : 'bg-destructive/10'
                                        }`}>
                                        {quizScore >= Math.ceil(activeContent.quiz.length * 0.6) ? (
                                            <Trophy className="w-10 h-10 text-success" />
                                        ) : (
                                            <XCircle className="w-10 h-10 text-destructive" />
                                        )}
                                    </div>

                                    <h2 className="font-display text-2xl font-bold mb-2">
                                        {quizScore >= Math.ceil(activeContent.quiz.length * 0.6) ? 'Congratulations!' : 'Keep Practicing!'}
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        You scored {quizScore} out of {activeContent.quiz.length}
                                        {quizScore >= Math.ceil(activeContent.quiz.length * 0.6)
                                            ? '. Topic completed!'
                                            : `. You need ${Math.ceil(activeContent.quiz.length * 0.6)} to pass.`}
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        {quizScore < Math.ceil(activeContent.quiz.length * 0.6) && (
                                            <Button variant="outline" onClick={handleStartQuiz}>
                                                Try Again
                                            </Button>
                                        )}
                                        {quizScore >= Math.ceil(activeContent.quiz.length * 0.6) && (
                                            activeIndex < moduleData.subheadings.length - 1 ? (
                                                <Button onClick={handleMoveToNextSubheading} className="gap-2">
                                                    Continue to {moduleData.subheadings[activeIndex + 1].name}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button onClick={handleNextModule} className={`gap-2 bg-gradient-to-r ${moduleData.gradient}`}>
                                                    {NEXT_MODULE[moduleId as string] ? `Go to ${MODULE_DATA[NEXT_MODULE[moduleId as string]]?.name}` : 'Complete Roadmap'}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
