// 導覽列互動效果
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
    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
        fadeInSkills();
    }
});

// 監聽導覽列選項點擊，並平滑滾動到對應區域
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // 獲取導覽列的高度，作為滾動的偏移量
        const navHeight = document.querySelector('header').offsetHeight;
        
        // 使用更平滑的滾動效果
        smoothScroll(targetElement, navHeight);
    });
});

// 平滑滾動函數，更好的跨瀏覽器兼容性
function smoothScroll(targetElement, offset = 0) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // 滾動持續時間，毫秒
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const scrollY = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, scrollY);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    // 緩動函數，使滾動更加平滑
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// 更新當前活動的導覽列選項
const updateActiveNavLink = () => {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-list a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

// 監聽滾動事件，更新活動的導覽列選項
window.addEventListener('scroll', updateActiveNavLink);