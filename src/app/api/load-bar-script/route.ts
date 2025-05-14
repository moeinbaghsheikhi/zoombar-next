
// src/app/api/load-bar-script/route.ts
import { getUserBars } from '@/lib/mockData'; // Not actually used for data fetching here, see comments
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const commonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/javascript', 
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: commonHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const barId = searchParams.get('barId');
    const userId = searchParams.get('userId');

    if (!barId || !userId) {
      const errorScript = `console.error('ZoomBar Lite: Bar ID or User ID missing in script URL.');`;
      return new NextResponse(errorScript, { status: 400, headers: commonHeaders });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (new URL(request.url)).origin;

    const clientScript = `
(function() {
  if (document.getElementById('zoombar-lite-container-${barId}')) {
    return; // Bar already loaded or being loaded
  }

  var barContainer = document.createElement('div');
  barContainer.id = 'zoombar-lite-container-${barId}';
  var timerInterval; // Variable for countdown interval

  function removeBar() {
    if (timerInterval) clearInterval(timerInterval);
    var barElement = document.querySelector('[data-zoombar-id="${barId}"]');
    if (barElement) {
        barElement.style.transform = 'translateY(-100%)';
        var currentBodyPaddingTop = parseFloat(document.body.style.paddingTop) || 0;
        var barHeight = barElement.offsetHeight;
        document.body.style.paddingTop = Math.max(0, currentBodyPaddingTop - barHeight) + 'px';
    }
    setTimeout(function() {
      if (barContainer.parentNode) {
        barContainer.parentNode.removeChild(barContainer);
      }
    }, 300); // Match transition duration
  }

  fetch('${baseUrl}/api/get-announcement-bar?barId=${barId}&userId=${userId}')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok. Status: ' + response.status + ' - ' + response.statusText);
      }
      return response.json();
    })
    .then(function(data) {
      if (data && data.message) {
        // Check for expiration
        if (data.expiresAt) {
          var expirationDate = new Date(data.expiresAt);
          if (expirationDate.getTime() <= Date.now()) {
            console.log('ZoomBar Lite: Bar ID ${barId} has expired.');
            return; // Do not display expired bar
          }
        }

        var bar = document.createElement('div');
        bar.setAttribute('data-zoombar-id', '${barId}');
        var barStyles = {
          backgroundColor: data.backgroundColor || '#f0f0f0',
          color: data.textColor || '#333333',
          textAlign: 'center',
          padding: '12px 15px',
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          zIndex: '999999',
          boxSizing: 'border-box',
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease-out',
          transform: 'translateY(-100%)'
        };
        for (var styleKey in barStyles) {
          bar.style[styleKey] = barStyles[styleKey];
        }
        
        var contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'flex';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.justifyContent = 'center';
        contentWrapper.style.gap = '10px';
        contentWrapper.style.maxWidth = '1200px';
        contentWrapper.style.margin = '0 auto';
        contentWrapper.style.position = 'relative'; // For timer positioning

        if (data.imageUrl) {
          var img = document.createElement('img');
          var imgStyles = { height: '24px', width: 'auto', maxHeight: '24px', verticalAlign: 'middle', borderRadius: '3px' };
          for (var imgStyleKey in imgStyles) { img.style[imgStyleKey] = imgStyles[imgStyleKey]; }
          img.src = data.imageUrl;
          img.alt = 'Notification Image';
          contentWrapper.appendChild(img);
        }
        
        var textNode = document.createElement('span');
        textNode.textContent = data.message;
        contentWrapper.appendChild(textNode);

        // Countdown Timer Logic
        if (data.expiresAt) {
          var timerSpan = document.createElement('span');
          var timerStyles = {
            fontSize: '0.9em',
            marginLeft: '15px', // RTL: marginRight
            opacity: '0.85'
          };
           if (document.documentElement.dir === 'rtl') {
              timerStyles.marginLeft = '0';
              timerStyles.marginRight = '15px';
           }
          for (var timerStyleKey in timerStyles) {
            timerSpan.style[timerStyleKey] = timerStyles[timerStyleKey];
          }
          contentWrapper.appendChild(timerSpan);

          function updateTimer() {
            var now = new Date().getTime();
            var distance = new Date(data.expiresAt).getTime() - now;

            if (distance < 0) {
              clearInterval(timerInterval);
              timerSpan.textContent = "منقضی شده";
              removeBar();
              return;
            }

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            var timerText = "زمان باقی‌مانده: ";
            if (days > 0) timerText += days + " روز ";
            if (hours > 0 || days > 0) timerText += hours + " ساعت ";
            timerText += minutes + " دقیقه " + seconds + " ثانیه";
            timerSpan.textContent = timerText;
          }
          updateTimer(); // Initial call
          timerInterval = setInterval(updateTimer, 1000);
        }
        
        var closeButton = document.createElement('button');
        var closeBtnStyles = {
            background: 'transparent', border: 'none', color: data.textColor || '#333333',
            fontSize: '18px', cursor: 'pointer', padding: '0 5px',
            position: 'absolute', top: '50%', transform: 'translateY(-50%)'
        };
        if (document.documentElement.dir === 'rtl') {
            closeBtnStyles.left = '15px';
        } else {
            closeBtnStyles.right = '15px';
        }
        for (var btnStyleKey in closeBtnStyles) { closeButton.style[btnStyleKey] = closeBtnStyles[btnStyleKey]; }
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'بستن اعلان');
        closeButton.onclick = removeBar;
        
        bar.appendChild(contentWrapper);
        bar.appendChild(closeButton); // Close button is child of bar, not contentWrapper for absolute pos
        barContainer.appendChild(bar);
        
        var injectBar = function() {
            if (document.body) {
                document.body.insertBefore(barContainer, document.body.firstChild);
                var currentBodyPaddingTop = parseFloat(document.body.style.paddingTop) || 0;
                document.body.style.paddingTop = (currentBodyPaddingTop + bar.offsetHeight) + 'px';
                setTimeout(function() { bar.style.transform = 'translateY(0)'; }, 50);
            } else {
                window.addEventListener('DOMContentLoaded', injectBar, { once: true });
            }
        };
        injectBar();

      } else if (data && data.error) {
        console.warn('ZoomBar Lite: Could not load bar - Server error: ' + data.error);
      }
    })
    .catch(function(error) {
      console.error('ZoomBar Lite: Error fetching announcement bar:', error);
    });
})();
    `;

    return new NextResponse(clientScript.trim(), { headers: commonHeaders });

  } catch (error: any) {
    console.error('API Error in load-bar-script:', error);
    const errorScript = `console.error('ZoomBar Lite: Server error while generating script - ${error.message}');`;
    return new NextResponse(errorScript, { status: 500, headers: commonHeaders });
  }
}
