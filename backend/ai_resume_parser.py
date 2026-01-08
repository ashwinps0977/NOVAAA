import sys
import json
import re
import spacy
from pdfminer.high_level import extract_text
import docx2txt
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_file(filepath):
    """Extract text from PDF or DOC/DOCX files"""
    if filepath.endswith('.pdf'):
        return extract_text(filepath)
    elif filepath.endswith(('.doc', '.docx')):
        return docx2txt.process(filepath)
    else:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

def extract_skills(text):
    """Extract skills from resume text using NLP"""
    doc = nlp(text)
    
    # Common skills dictionary
    common_skills = {
        'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift'],
        'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring'],
        'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle'],
        'devops': ['aws', 'docker', 'kubernetes', 'jenkins', 'git', 'terraform', 'ansible', 'ci/cd'],
        'data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'spark', 'hadoop'],
        'tools': ['git', 'jira', 'confluence', 'slack', 'figma', 'photoshop']
    }
    
    found_skills = []
    text_lower = text.lower()
    
    # Check for each skill category
    for category, skills in common_skills.items():
        for skill in skills:
            if skill in text_lower:
                found_skills.append(skill)
    
    # Extract nouns and proper nouns that might be skills
    for token in doc:
        if (token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 2 and 
            token.text.lower() not in found_skills):
            # Check if it looks like a technical skill
            if re.match(r'^[A-Za-z0-9+.#-]+$', token.text):
                found_skills.append(token.text)
    
    return list(set(found_skills))[:15]  # Return top 15 unique skills

def extract_experience(text):
    """Extract years of experience from resume"""
    # Look for experience patterns
    patterns = [
        r'(\d+)\+?\s*(years?|yrs?)\s*experience',
        r'experience\s*:\s*(\d+)\+?\s*(years?|yrs?)',
        r'(\d+)\+?\s*(years?|yrs?)\s*in\s*[A-Za-z]+',
        r'(\d+)\s*(years?|yrs?)\s*professional'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    # If no explicit experience, look for date ranges
    date_pattern = r'(19|20)\d{2}.*?(?:to|–|-).*?(?:present|now|(19|20)\d{2})'
    matches = re.findall(date_pattern, text, re.IGNORECASE)
    if matches:
        return len(matches)  # Approximate years based on job count
    
    return 0

def extract_education(text):
    """Extract education information"""
    degrees = []
    
    # Degree patterns
    degree_patterns = [
        r'\b(B\.?S\.?|B\.?A\.?|Bachelor)\b',
        r'\b(M\.?S\.?|M\.?A\.?|Master)\b',
        r'\b(Ph\.?D\.?|Doctorate)\b',
        r'\b(Associate|Diploma|Certificate)\b'
    ]
    
    for pattern in degree_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            match = re.search(pattern, text, re.IGNORECASE)
            degrees.append(match.group(0))
    
    return ", ".join(set(degrees))

def calculate_similarity(text1, text2):
    """Calculate cosine similarity between two texts"""
    if not text1 or not text2:
        return 0
    
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        vectors = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])
        return similarity[0][0]
    except:
        return 0

def analyze_resume(filepath, job_data):
    """Main analysis function"""
    try:
        # Extract text
        resume_text = extract_text_from_file(filepath)
        
        # Extract information
        skills = extract_skills(resume_text)
        experience = extract_experience(resume_text)
        education = extract_education(resume_text)
        
        # Calculate match with job requirements
        job_req_text = job_data.get('job_requirements', '') + ' ' + ' '.join(job_data.get('required_skills', []))
        
        similarity_score = calculate_similarity(resume_text, job_req_text)
        
        # Additional scoring factors
        required_skills = job_data.get('required_skills', [])
        matched_skills = len(set(skills) & set(required_skills))
        skill_match_ratio = matched_skills / len(required_skills) if required_skills else 0
        
        experience_match = 1 if experience >= job_data.get('experience_needed', 0) else experience / max(job_data.get('experience_needed', 1), 1)
        
        # Overall score (0-100)
        overall_score = (
            similarity_score * 40 +  # Text similarity (0-40)
            skill_match_ratio * 40 +  # Skill match (0-40)
            experience_match * 20     # Experience match (0-20)
        )
        
        return {
            "success": True,
            "skills": skills,
            "experience": experience,
            "education": education,
            "similarity_score": float(similarity_score),
            "skill_match_ratio": float(skill_match_ratio),
            "matched_skills_count": matched_skills,
            "overall_score": min(100, int(overall_score * 100)),
            "extracted_text_preview": resume_text[:1000]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "skills": [],
            "experience": 0,
            "education": "",
            "overall_score": 0
        }

if __name__ == "__main__":
    try:
        filepath = sys.argv[1]
        job_data_json = sys.argv[2]
        job_data = json.loads(job_data_json)
        
        result = analyze_resume(filepath, job_data)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "skills": [],
            "experience": 0,
            "education": "",
            "overall_score": 0
        }))