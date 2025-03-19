// 修復導覽列平滑滾動功能

// 獲取所有元素
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-list a');

// 滾動時縮小導覽列
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 漢堡選單
menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// 點擊導覽列連結時關閉漢堡選單
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        
        // 更新活動連結
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
    });
});

// 導覽列滑鼠懸停互動效果
navLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
        // 創建漣漪效果
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '5px';
        ripple.style.height = '5px';
        ripple.style.background = 'rgba(94, 96, 206, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '1';
        ripple.style.transition = 'all 0.6s ease';
        
        link.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.transform = 'scale(20)';
            ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 改良的平滑滾動功能
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (!targetElement) return; // 如果找不到目標元素則不執行
        
        // 獲取導覽列的高度
        const navHeight = document.querySelector('header').offsetHeight;
        
        // 計算正確的滾動位置
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        // 使用原生的平滑滾動 API，更快速且更穩定
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // 更新活動導覽項目
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        this.classList.add('active');
    });
});

// 技能進度條和數字動畫
const skillSections = document.querySelectorAll('.skill-category');

const fadeInSkills = () => {
    // 進度條動畫
    document.querySelectorAll('.skill-progress').forEach(progressBar => {
        const width = progressBar.dataset.width;
        progressBar.style.width = width;
    });
    
    // 數字百分比動畫 - 選取所有技能項目
    document.querySelectorAll('.skill-item').forEach(item => {
        const percentElement = item.querySelector('.skill-info span');
        const progressBar = item.querySelector('.skill-progress');
        
        if (percentElement && progressBar) {
            // 從data-width屬性獲取目標值（這是最可靠的來源）
            let finalValue = 0;
            const widthStr = progressBar.dataset.width;
            
            if (widthStr && widthStr.includes('%')) {
                finalValue = parseInt(widthStr);
            } else {
                // 備用：從文字內容解析
                const percentText = percentElement.textContent;
                if (percentText.includes('%')) {
                    finalValue = parseInt(percentText.replace('%', ''));
                } else {
                    finalValue = parseInt(percentText);
                }
            }
            
            // 確保有有效值
            if (isNaN(finalValue) || finalValue <= 0) {
                finalValue = 75; // 預設值
            }
            
            // 複製初始值以防出錯
            const originalText = percentElement.textContent;
            const targetValue = finalValue;
            
            // 設定初始值
            percentElement.textContent = '0%';
            
            // 開始動畫
            setTimeout(() => {
                animateValue(percentElement, 0, targetValue, 1500);
            }, 10);
        }
    });
};

// 數字動畫函數
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = `${currentValue}%`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // 確保最終值正確
            element.textContent = `${end}%`;
        }
    };
    window.requestAnimationFrame(step);
}

// 作品集篩選功能
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新活動按鈕
        filterBtns.forEach(filterBtn => filterBtn.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.dataset.filter;
        
        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.dataset.category === filterValue) {
                item.classList.remove('hide');
            } else {
                item.classList.add('hide');
            }
        });
    });
});

// 檢測元素是否在視口中
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('skill-category')) {
                fadeInSkills();
            }
        }
    });
}, { threshold: 0.3 });

skillSections.forEach(section => {
    observer.observe(section);
});

// 頁面載入時執行
window.addEventListener('load', () => {
    // 如果技能區域已經在視口中，則啟動動畫
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const rect = skillsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            fadeInSkills();
        }
    }
});

// 簡化版的滾動監聽，更新當前活動的導覽列選項
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + header.offsetHeight + 20; // 額外偏移量確保更好的觸發點
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});