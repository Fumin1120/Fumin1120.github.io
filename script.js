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

// 優化的平滑滾動功能（修復聯絡節點問題）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        // 保存目前點擊的導覽項的引用，用於後續精確標識
        const clickedLink = this;
        const clickedHref = targetId;
        
        // 獲取導覽列高度
        const navHeight = document.querySelector('header').offsetHeight;
        
        // 精確計算目標位置
        const elementTop = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementTop + window.pageYOffset;
        
        // 增加足夠的偏移量，確保節點不會被導覽列遮擋
        const finalPosition = offsetPosition - navHeight - 20;
        
        // 設置目標導覽項為活動狀態
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
        
        // 定義滾動參數
        const duration = 600;  // 適中的持續時間
        const startTime = performance.now();
        const startPosition = window.pageYOffset;
        const distance = finalPosition - startPosition;
        
        // 使用平滑的滾動動畫函數
        function easeInOutCubic(t) {
            return t < 0.5 
                ? 4 * t * t * t 
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        // 執行滾動動畫
        function scroll(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(scroll);
            } else {
                // 確保最終位置精確
                window.scrollTo(0, finalPosition);
                
                // 強制設置正確的活動項，避免被自動檢測覆蓋
                setTimeout(() => {
                    navLinks.forEach(link => link.classList.remove('active'));
                    clickedLink.classList.add('active');
                    
                    // 將正確的目標ID存儲到全局變量，供updateActiveNavLink使用
                    window.currentActiveSection = clickedHref.replace('#', '');
                    
                    // 延遲適當時間後才恢復自動檢測
                    setTimeout(() => {
                        window.currentActiveSection = null;
                    }, 1000);
                }, 100);
            }
        }
        
        requestAnimationFrame(scroll);
    });
});

// 準確的活動導覽項目更新函數（修復聯絡與證照錯誤識別問題）
function updateActiveNavLink() {
    // 如果正在使用手動設置的活動區段，則優先使用它
    if (window.currentActiveSection) {
        const manualActiveId = window.currentActiveSection;
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === `#${manualActiveId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        return;
    }
    
    // 找出所有有ID的區段
    const sections = Array.from(document.querySelectorAll('section[id]'));
    
    // 如果沒有區段，則不執行
    if (sections.length === 0) return;
    
    // 獲取導覽列高度
    const navHeight = document.querySelector('header').offsetHeight;
    
    // 當前滾動位置加上偏移量
    const scrollPosition = window.pageYOffset + navHeight + 40; // 增加偏移量以改善檢測
    
    // 尋找最接近的區段，使用改進的算法
    let activeSection = null;
    
    // 特殊處理：先檢查是否接近頁面底部（用於聯絡區段）
    const pageBottom = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollBottom = window.pageYOffset + viewportHeight;
    
    // 如果接近頁面底部（距離小於視窗高度的25%），則考慮最後一個區段為活動區段
    if (pageBottom - scrollBottom < viewportHeight * 0.25) {
        // 找出最後一個區段（通常是聯絡區段）
        activeSection = sections[sections.length - 1];
    } else {
        // 否則使用距離檢測
        let minDistance = Infinity;
        
        // 分析每個區段
        for (const section of sections) {
            // 計算區段的邊界
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            // 檢測是否在區段內部
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section;
                break; // 找到確切匹配，立即結束
            }
            
            // 如果不在區段內，使用距離為依據
            const topDistance = Math.abs(scrollPosition - sectionTop);
            const bottomDistance = Math.abs(scrollPosition - sectionBottom);
            const minSectionDistance = Math.min(topDistance, bottomDistance);
            
            if (minSectionDistance < minDistance) {
                minDistance = minSectionDistance;
                activeSection = section;
            }
        }
    }
    
    // 更新導覽列項目
    if (activeSection) {
        const activeSectionId = activeSection.id;
        
        // 特殊處理聯絡區段，確保正確識別
        if (activeSectionId === 'contact' || 
            (activeSection === sections[sections.length - 1] && sections.length > 1)) {
            // 確保它是頁面上最後一個區段時才標記為聯絡區段
            const contactLink = Array.from(navLinks).find(link => 
                link.getAttribute('href') === '#contact');
                
            if (contactLink) {
                navLinks.forEach(link => link.classList.remove('active'));
                contactLink.classList.add('active');
                return;
            }
        }
        
        // 常規更新其他導覽項
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === `#${activeSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// 初始化和滾動時更新導覽項目
window.addEventListener('scroll', updateActiveNavLink);
window.addEventListener('load', () => {
    // 初始化全局變量用於追蹤手動設置的活動區段
    window.currentActiveSection = null;
    
    // 初始更新導覽狀態
    updateActiveNavLink();
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