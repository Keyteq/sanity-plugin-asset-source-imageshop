import React, { useEffect } from "react";

interface IProps {
  options: any
}

const ImageShopIFrame: React.FunctionComponent<IProps> = ({ options }) => {

  useEffect(() => {
    const handler = event: any => {
      const data = JSON.parse(event.data)
      console.log("Hello World?", data)
    }

    window.addEventListener("message", handler)

    // clean up
    return () => window.removeEventListener("message", handler)
  }, []) // empty array => run only once

  return (
    <div>
      <iframe srcDoc={`
      
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=10">

        <title>Imageshop</title>

        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

        <style type="text/css">
            iframe { width: 100%; overflow-x: hidden;overflow-y: scroll;height: 3500px;border: 0px none;margin: 0px; padding: 0px;  }
            iframe.safari { overflow: hidden }
            body {margin: 0px;padding:0px;overflow: hidden;}
            body.safari { overflow-x: hidden;overflow-y: scroll;}
        </style>
        <script type="text/javascript">
        
            function setSize() {
                if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
                    var columns = parseInt(($("iframe").width() - 50) / 152);
                    var rows = Math.ceil(50 / columns);
                    var height = $(window).width() + rows * 298 + 100;

                    $("iframe").height(height);
                    $("iframe").addClass("safari");
                    $("body").addClass("safari");
                } else {
                    $("iframe").height($(window).height());
                    $("iframe").width($(window).width());
                }
            }

            function listener(event) {
                var eventdata = event.data.split(";");
                insert(eventdata[0], eventdata[1], eventdata[2], eventdata[3]);
            }

            $(function () {

                var loc = window.location.toString(),
                    params = loc.split('?')[1],
                    iframe = document.getElementById("MyFrame");

                iframe.src = "https://client.imageshop.no/InsertImage2.aspx" + '?IFRAMEINSERT=true&' + params;
            
                $(window).resize(function () {
                    setSize();
                });

                setSize();

                if (window.addEventListener) {
                    addEventListener("message", listener, false);
                } else {
                    attachEvent("onmessage", listener);
                }


            });

            function insert(file, title, width, height) {
                window.parent.opener.postMessage(file, '*');
                window.close();
            }

        </script>
    </head>
    <body>
        <iframe id="MyFrame"/>

    </body>
</html>
      `}>

      </iframe>
    </div>
  )
}


export default ImageShopIFrame
