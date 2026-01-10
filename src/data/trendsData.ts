export interface Trend {
    id: string;
    title: string;
    description: string;
    image: string;
    whyTrending: string;
    keySkills: string[];
    learningPath: string[];
    targetSkillId: string; // Matches the CAREERS id in Dashboard
}

export const trends: Trend[] = [
    {
        id: 'full-stack',
        title: 'Full Stack Development',
        description: 'Build complete web applications from front to back.',
        image: '/trend-fullstack.png',
        whyTrending: 'Companies seek versatile developers who can handle the entire stack, reducing team size and communication overhead while increasing delivery speed.',
        keySkills: ['React/Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
        learningPath: ['Master Frontend Basics (HTML/CSS/JS)', 'Learn React Frameworks', 'Understand Backend APIs', 'Database Management', 'Deployment & CI/CD'],
        targetSkillId: 'Full-Stack Development'
    },
    {
        id: 'ml-engineering',
        title: 'ML Engineering',
        description: 'Deploy and maintain scalable machine learning systems.',
        image: '/trend-ml.png',
        whyTrending: 'The AI boom requires engineers who can not only build models but productize them, scaling AI solutions to millions of users reliably.',
        keySkills: ['Python', 'PyTorch/TensorFlow', 'MLOps', 'Docker/Kubernetes', 'Cloud AI Services'],
        learningPath: ['Python Proficiency', 'Data Handling with Pandas', 'Machine Learning Fundamentals', 'Deep Learning Architectures', 'Model Deployment & MLOps'],
        targetSkillId: 'AI / Machine Learning'
    },
    {
        id: 'data-science',
        title: 'Data Science',
        description: 'Extract actionable insights from complex data sets.',
        image: '/trend-ds.png',
        whyTrending: 'Data is the new oil. Organizations need experts to analyze vast amounts of data to drive strategic business decisions and optimize operations.',
        keySkills: ['Python/R', 'SQL', 'Statistical Analysis', 'Data Visualization', 'Big Data Tools'],
        learningPath: ['Mathematics & Statistics', 'Programming for Data', 'Exploratory Data Analysis', 'Machine Learning basics', 'Big Data Technologies'],
        targetSkillId: 'Data Science'
    },
    {
        id: 'devops',
        title: 'DevOps & Cloud',
        description: 'Bridge development and operations for faster delivery.',
        image: '/trend-devops.png',
        whyTrending: 'As cloud adoption grows, the need for automated infrastructure, CI/CD pipelines, and reliable system operations is at an all-time high.',
        keySkills: ['Linux', 'AWS/Azure', 'Docker & Kubernetes', 'Terraform', 'CI/CD Pipelines'],
        learningPath: ['OS & Networking Basics', 'Cloud Provider Fundamentals', 'Containerization', 'Infrastructure as Code', 'Observability & Monitoring'],
        targetSkillId: 'DevOps'
    }
];
