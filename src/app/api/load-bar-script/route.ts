
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
    return; 
  }

  var barContainer = document.createElement('div');
  barContainer.id = 'zoombar-lite-container-${barId}';
  var timerInterval; 

  function removeBar() {
    if (timerInterval) clearInterval(timerInterval);
    var barElement = document.querySelector('[data-zoombar-id="${barId}"]');
    if (barElement) {
        barElement.style.transform = 'translateY(-150%)'; 
        var currentBodyPaddingTop = parseFloat(document.body.style.paddingTop) || 0;
        var barHeight = barElement.offsetHeight;
        document.body.style.paddingTop = Math.max(0, currentBodyPaddingTop - barHeight) + 'px';
    }
    setTimeout(function() {
      if (barContainer.parentNode) {
        barContainer.parentNode.removeChild(barContainer);
      }
    }, 300); 
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
        if (data.expiresAt) {
          var expirationDate = new Date(data.expiresAt);
          if (expirationDate.getTime() <= Date.now()) {
            console.log('ZoomBar Lite: Bar ID ${barId} has expired.');
            return; 
          }
        }

        var bar = document.createElement('div');
        bar.setAttribute('data-zoombar-id', '${barId}');
        var barStyles = {
          backgroundColor: data.backgroundColor || '#333333',
          color: data.textColor || '#ffffff',
          padding: '10px 15px', 
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          zIndex: '999999',
          boxSizing: 'border-box',
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
          transition: 'transform 0.3s ease-out',
          transform: 'translateY(-150%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', 
          gap: '15px',
        };
        for (var styleKey in barStyles) {
          bar.style[styleKey] = barStyles[styleKey];
        }
        
        var isRTL = document.documentElement.dir === 'rtl';

        var messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.alignItems = 'center';
        messageWrapper.style.gap = '10px';
        messageWrapper.style.flexGrow = '1';
        messageWrapper.style.justifyContent = isRTL ? 'flex-end' : 'flex-start'; 


        if (data.imageUrl) {
          var img = document.createElement('img');
          var imgStyles = { height: '32px', width: 'auto', maxHeight: '32px', verticalAlign: 'middle', borderRadius: '4px' };
          for (var imgStyleKey in imgStyles) { img.style[imgStyleKey] = imgStyles[imgStyleKey]; }
          img.src = data.imageUrl;
          img.alt = 'Notification Image';
          messageWrapper.appendChild(img);
        }
        
        var textNode = document.createElement('span');
        textNode.textContent = data.message;
        textNode.style.fontSize = '0.95em';
        messageWrapper.appendChild(textNode);

        var timerContainer = document.createElement('div');
        timerContainer.style.display = 'flex';
        timerContainer.style.gap = '5px'; 
        timerContainer.style.alignItems = 'center';
        timerContainer.style.direction = 'ltr'; // Keep timer itself LTR for number display

        var timerBoxes = {
          days: { el: null, unit: "روز" },
          hours: { el: null, unit: "ساعت" },
          minutes: { el: null, unit: "دقیقه" },
          seconds: { el: null, unit: "ثانیه" }
        };

        function createTimerBox(unitText, timerData) {
          var box = document.createElement('div');
          var boxBaseStyles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '45px', 
            textAlign: 'center',
            lineHeight: '1.2',
            padding: '5px 8px', // Default padding
          };
          
          var boxDynamicStyles = {
            backgroundColor: timerData.timerStyle === 'none' ? 'transparent' : (timerData.timerBackgroundColor || '#FC4C1D'),
            color: timerData.timerTextColor || '#FFFFFF',
            borderRadius: '4px', // Default for square
          };

          if (timerData.timerStyle === 'circle') {
            boxDynamicStyles.borderRadius = '50%';
            // Ensure circle is actually a circle with equal width/height if minWidth is an issue
            boxBaseStyles.minWidth = '50px'; // Adjust if needed for circle aspect
            boxBaseStyles.height = '50px'; // Adjust if needed for circle aspect
          } else if (timerData.timerStyle === 'none') {
            boxDynamicStyles.padding = '0'; 
            boxDynamicStyles.minWidth = 'auto'; 
          }
          
          var allStyles = { ...boxBaseStyles, ...boxDynamicStyles };
          for (var sKey in allStyles) { box.style[sKey] = allStyles[sKey]; }
          
          var valueSpan = document.createElement('span');
          valueSpan.style.fontSize = '1.1em';
          valueSpan.style.fontWeight = 'bold';
          box.appendChild(valueSpan);
          
          var unitSpan = document.createElement('span');
          unitSpan.style.fontSize = '0.7em';
          unitSpan.textContent = unitText;
          box.appendChild(unitSpan);
          
          return { container: box, valueEl: valueSpan };
        }
        
        if (data.expiresAt) {
          timerBoxes.days.el = createTimerBox(timerBoxes.days.unit, data);
          timerBoxes.hours.el = createTimerBox(timerBoxes.hours.unit, data);
          timerBoxes.minutes.el = createTimerBox(timerBoxes.minutes.unit, data);
          timerBoxes.seconds.el = createTimerBox(timerBoxes.seconds.unit, data);
          
          // Order for LTR display of timer units (e.g., D H M S)
          if (timerBoxes.days.el) timerContainer.appendChild(timerBoxes.days.el.container);
          timerContainer.appendChild(timerBoxes.hours.el.container);
          timerContainer.appendChild(timerBoxes.minutes.el.container);
          timerContainer.appendChild(timerBoxes.seconds.el.container);


          function updateTimer() {
            var now = new Date().getTime();
            var distance = new Date(data.expiresAt).getTime() - now;

            if (distance < 0) {
              clearInterval(timerInterval);
              Object.values(timerBoxes).forEach(tb => {
                if (tb.el) tb.el.valueEl.textContent = "00";
              });
              removeBar();
              return;
            }

            var d = Math.floor(distance / (1000 * 60 * 60 * 24));
            var h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var s = Math.floor((distance % (1000 * 60)) / 1000);
            
            timerBoxes.seconds.el.valueEl.textContent = String(s).padStart(2, '0');
            timerBoxes.minutes.el.valueEl.textContent = String(m).padStart(2, '0');
            timerBoxes.hours.el.valueEl.textContent = String(h).padStart(2, '0');
            
            if (d > 0) {
              timerBoxes.days.el.valueEl.textContent = String(d).padStart(2, '0');
              if (!timerBoxes.days.el.container.parentNode) { // Check if days box is already in timer
                 // Insert days box at the beginning of the timer container
                 timerContainer.insertBefore(timerBoxes.days.el.container, timerContainer.firstChild);
              }
            } else {
              if (timerBoxes.days.el && timerBoxes.days.el.container.parentNode) {
                timerContainer.removeChild(timerBoxes.days.el.container);
              }
            }
          }
          updateTimer(); 
          timerInterval = setInterval(updateTimer, 1000);
        }
        
        var closeButton = document.createElement('button');
        var closeBtnStyles = {
            background: 'transparent', border: 'none', 
            color: data.textColor || '#ffffff', 
            fontSize: '20px', cursor: 'pointer', padding: '0 5px',
            lineHeight: '1', 
            opacity: '0.7',
        };
         for (var btnStyleKey in closeBtnStyles) { closeButton.style[btnStyleKey] = closeBtnStyles[btnStyleKey]; }
        closeButton.onmouseover = function() { this.style.opacity = '1'; };
        closeButton.onmouseout = function() { this.style.opacity = '0.7'; };
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'بستن اعلان');
        closeButton.onclick = removeBar;
        
        // Order of elements: Timer (visual left) | Message (visual right) | Close (visual far right for RTL)
        // For LTR: Close (visual left) | Message (visual middle) | Timer (visual right)
        if (isRTL) {
            bar.appendChild(closeButton); // Appears visually right-most in RTL for space-between
            bar.appendChild(messageWrapper); // Appears visually middle (or left of close)
            if (data.expiresAt) bar.appendChild(timerContainer); // Appears visually left-most
        } else { 
            bar.appendChild(closeButton); // Appears visually left-most in LTR
            bar.appendChild(messageWrapper); // Appears visually middle
            if (data.expiresAt) bar.appendChild(timerContainer); // Appears visually right-most
        }
        
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

    