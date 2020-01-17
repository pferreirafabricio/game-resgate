window.fbAsyncInit = function() 
{
    FB.init({
			appId : '278286666256055', // App ID
			status: true, 
			cookie: true, 
			frictionlessRequests: true, 
			xfbml: true,
			version    : 'v2.0'
			});

	//Definições de logon

	//Verifica se o usuário está logado
	FB.getLoginStatus(function(response) 
	{
		if (response.status === 'connected') 
		{
			accessToken = response.authResponse.accessToken;
			
			FB.api('/me', function(info) 
			{
				console.log(info);     
            });
						
		} 
		else if (response.status === 'not_authorized')
		{
			//Usuário logado ao Facebook, mas não registrado

			  logar();

		} 
		else 
		{
			window.top.location ='https://www.facebook.com';
		} 
	});
};

//Função Logar

function logar() 
{
	var oauth_url = 'https://www.facebook.com/dialog/oauth/';
	oauth_url += '?client_id=278286666256055'; //App ID
	oauth_url += '&redirect_uri=' + 'https://localhost/facebook/'; //Endereço URL do app
	oauth_url += '&scope=user_about_me,email,user_location,user_photos,user_birthday,publish_actions,user_friends,profile_pic,picture';
	window.top.location = oauth_url;
}
//,

// Carrega o JavaScript SDK 
(function(d, s, id)
{
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/pt_BR/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



function start() 
{ // Inicio da função start()

	exibeAmigos();

	//Exibe nome do Piloto
	FB.api('/me', function(info) 
	{
		var nome=info.name; //first_name
		$("#piloto").html("<h2> Piloto: " + nome + "</h2>");        
    });
	
	
	//Exibe foto do Piloto	
	FB.api(
        {
          method: 'fql.query',
          query: 'SELECT picture FROM user WHERE uid = me()',  
        },	
		
		function(data) 
		{
        	var dados=data;
      		var foto=dados[0].picture;
		
			$("#foto1").css("background-image", 'url("' + foto + '")');
		});
	
	
	//Exibe fotos dos amigos
	
	function exibeAmigos() 
	{
			
		FB.api(
			{
			  method: 'fql.query',
			  query: 'SELECT picture FROM user WHERE uid IN(SELECT uid2 FROM friend WHERE uid1 = me())',
				
			},
			
			function(data) 
			{
				var dados = data;
				var total = dados.length;
				var amigo1 = parseInt(Math.random() * total);
				var foto2 = dados[amigo1].picture; //pic_square, picture
				
				$("#foto2").css("background-image", 'url("' + foto2 + '")');
			});
			
	}
	
	/*
	function getFBData() 
	{
	  FB.api('/me', function(response) 
	  {
		  fbinfo = new Array();
		  fbinfo[0] = response.id;
		  fbinfo[1] = response.first_name;
		  fbinfo[2] = response.last_name;
		  fbinfo[3] = response.email;

		  var im = document.getElementById("profileImage").setAttribute("src", "http://graph.facebook.com/" + response.id + "/picture?type=normal");
		  
		  $("#foto1").css("background-image", 'url("' + im + '")');
	  });
	}
	*/

	$("#inicio").hide();
	
	$("#fundoGame").append("<div id='jogador' class='anima1'></div>");
	$("#fundoGame").append("<div id='inimigo1' class='anima2'></div>");
	$("#fundoGame").append("<div id='inimigo2'></div>");
	$("#fundoGame").append("<div id='amigo' class='anima3'></div>");
	$("#fundoGame").append("<div id='placar'></div>");
	$("#fundoGame").append("<div id='energia'></div>");
	$("#fundoGame").append("<div id='piloto'></div>");
	$("#fundoGame").append("<div id='foto1'></div>");
	$("#fundoGame").append("<div id='foto2'></div>");

	
	//Principais variáveis do jogo
	
	var energiaAtual=3;
	var pontos=0;
	var salvos=0;
	var perdidos=0;
	var podeAtirar =  true;
	var fimdejogo  = false;
	var jogo = {};
	var velocidade = 5;
	var posicaoY = parseInt(Math.random() * 334);
	var TECLA = {
					W: 87,
					S: 83,
					D: 68
				}
	jogo.pressionou = [];
	
	var somDisparo=document.getElementById("somDisparo");
	var somExplosao=document.getElementById("somExplosao");
	var musica=document.getElementById("musica");
	var somGameover=document.getElementById("somGameover");
	var somPerdido=document.getElementById("somPerdido");
	var somResgate=document.getElementById("somResgate");
	
	//Música em loop
	musica.addEventListener("ended", function()
											  { musica.currentTime = 0; musica.play(); }, false);
	musica.play();

	
	//Game Loop

	jogo.timer = setInterval(loop,30);
	
	function loop()
	{	
		movefundo();
		movejogador();
		moveinimigo1();
		moveinimigo2();
		moveamigo();
		colisao();
		placar();	
		energia();
		atualizaFotos();


	} // Fim da função loop()

	//Verifica se o usuário pressionou alguma tecla	
	
	$(document).keydown(function(e)
	{
		jogo.pressionou[e.which] = true; 
	});

	$(document).keyup(function(e)
	{
       jogo.pressionou[e.which] = false;
	});

//Função que movimenta o fundo do jogo
	
	function movefundo() 
	{
		esquerda = parseInt($("#fundoGame").css("background-position"));
		$("#fundoGame").css("background-position",esquerda-1);
	} // fim da função movefundo()
	
	
	function movejogador()
	{
		if (jogo.pressionou[TECLA.W]) 
		{
			var topo = parseInt($("#jogador").css("top"));
			$("#jogador").css("top",topo-10); 
			
			if (topo<=0) 
			{
				$("#jogador").css("top",topo+10);
			}
		}
		
		if (jogo.pressionou[TECLA.S]) 
		{
			var topo = parseInt($("#jogador").css("top"));
			$("#jogador").css("top",topo+10); 
			
			if (topo>=434) 
			{	
				$("#jogador").css("top",topo-10);	
			}
		}
		
		if (jogo.pressionou[TECLA.D])
		{
			disparo();	
		}

	} // fim da função movejogador()
	
	function moveinimigo1() 
	{
		posicaoX = parseInt($("#inimigo1").css("left"));
		$("#inimigo1").css("left",posicaoX-velocidade);
		$("#inimigo1").css("top",posicaoY);
			
		if (posicaoX<=0)
		{
			posicaoY = parseInt(Math.random() * 334);
			$("#inimigo1").css("left",694);
			$("#inimigo1").css("top",posicaoY);	
		}
	} //Fim da função moveinimigo1()
	
	function moveinimigo2()
	{
        posicaoX = parseInt($("#inimigo2").css("left"));
		$("#inimigo2").css("left",posicaoX-3);
				
		if (posicaoX<=0) 
		{
			$("#inimigo2").css("left",775);			
		}
	} // Fim da função moveinimigo2()
	
	function moveamigo()
	{
		posicaoX = parseInt($("#amigo").css("left"));
		$("#amigo").css("left",posicaoX+1);
				
		if (posicaoX>906) {
			
		$("#amigo").css("left",0);
					
		}

	} // fim da função moveamigo()
	
	function disparo() 
	{
		if (podeAtirar==true)
		{
			somDisparo.play();
			podeAtirar=false;
			
			topo = parseInt($("#jogador").css("top"))
			posicaoX= parseInt($("#jogador").css("left"))
			tiroX = posicaoX + 190;
			topoTiro=topo+37;
			$("#fundoGame").append("<div id='disparo'></div>");
			$("#disparo").css("top",topoTiro);
			$("#disparo").css("left",tiroX);
			
			var tempoDisparo=window.setInterval(executaDisparo, 30);
		} //Fecha podeAtirar
	 
			function executaDisparo() 
			{
				posicaoX = parseInt($("#disparo").css("left"));
				$("#disparo").css("left",posicaoX+15); 

				if (posicaoX>900) 
				{
					window.clearInterval(tempoDisparo);
					tempoDisparo=null;
					$("#disparo").remove();
					podeAtirar=true;	
				}
		} // Fecha executaDisparo()
		
	} // Fecha disparo()
	
	function colisao()
	{
		var colisao1 = ($("#jogador").collision($("#inimigo1")));
		var colisao2 = ($("#jogador").collision($("#inimigo2")));
		var colisao3 = ($("#disparo").collision($("#inimigo1")));
		var colisao4 = ($("#disparo").collision($("#inimigo2")));
		var colisao5 = ($("#jogador").collision($("#amigo")));
		var colisao6 = ($("#inimigo2").collision($("#amigo")));
		
		
		//jogador com o inimigo1
		if (colisao1.length>0)
		{
			energiaAtual--;
			
			inimigo1X = parseInt($("#inimigo1").css("left"));
			inimigo1Y = parseInt($("#inimigo1").css("top"));
			explosao1(inimigo1X,inimigo1Y);

			posicaoY = parseInt(Math.random() * 334);
			$("#inimigo1").css("left",694);
			$("#inimigo1").css("top",posicaoY);
		}
		
		// jogador com o inimigo2 
		if (colisao2.length>0) 
		{
			energiaAtual--;
			
			inimigo2X = parseInt($("#inimigo2").css("left"));
			inimigo2Y = parseInt($("#inimigo2").css("top"));
			explosao2(inimigo2X,inimigo2Y);
					
			$("#inimigo2").remove();
				
			reposicionaInimigo2();	
		}	
		
		// Disparo com o inimigo1
		
		if (colisao3.length>0)
		{		
			pontos=pontos+100;	
			velocidade=velocidade+0.5;
			
			inimigo1X = parseInt($("#inimigo1").css("left"));
			inimigo1Y = parseInt($("#inimigo1").css("top"));
				
			explosao1(inimigo1X,inimigo1Y);
			$("#disparo").css("left",950);
				
			posicaoY = parseInt(Math.random() * 470); //334
			$("#inimigo1").css("left",694);
			$("#inimigo1").css("top",posicaoY);

		}
		
		// Disparo com o inimigo2
		
		if (colisao4.length>0)
		{	
			pontos=pontos+50;
	
			inimigo2X = parseInt($("#inimigo2").css("left"));
			inimigo2Y = parseInt($("#inimigo2").css("top"));
			$("#inimigo2").remove();

			explosao2(inimigo2X,inimigo2Y);
			$("#disparo").css("left",950);
			
			reposicionaInimigo2();
		}

		// jogador com o amigo
		
		if (colisao5.length>0)
		{		
			$("#foto2").hide();
	
			somResgate.play();
			salvos++;
		
			reposicionaAmigo();
			$("#amigo").remove();
		}
		
		//inimigo2 com o amigo
		
		if (colisao6.length>0)
		{	    
			$("#foto2").hide();	
			
			perdidos++;
	
			amigoX = parseInt($("#amigo").css("left"));
			amigoY = parseInt($("#amigo").css("top"));
			explosao3(amigoX,amigoY);
			$("#amigo").remove();
					
			reposicionaAmigo();					
		}

	} //Fim da função colisao()
	
	//Explosão 1
	function explosao1(inimigo1X,inimigo1Y) 
	{
		somExplosao.play();
		
		$("#fundoGame").append("<div id='explosao1'></div>");
		$("#explosao1").css("background-image", "url(imgs/explosao.png)");
		var div=$("#explosao1");
		div.css("top", inimigo1Y);
		div.css("left", inimigo1X);
		div.animate({width:200, opacity:0}, "slow");
		
		var tempoExplosao = window.setInterval(removeExplosao, 1000);
		
		function removeExplosao()
		{
			div.remove();
			window.clearInterval(tempoExplosao);
			tempoExplosao=null;
		}
		
	} // Fim da função explosao1()
	
	//Reposiciona Inimigo2
	
	function reposicionaInimigo2()
	{
		var tempoColisao4=window.setInterval(reposiciona4, 5000);
		
		function reposiciona4() 
		{
			window.clearInterval(tempoColisao4);
			tempoColisao4 = null;
			
			if (fimdejogo == false)
			{
				$("#fundoGame").append("<div id=inimigo2></div>");
			}
			
		}	
	}	
	
	//Explosão2
	
	function explosao2(inimigo2X,inimigo2Y) 
	{
		somExplosao.play();
		
		$("#fundoGame").append("<div id='explosao2'></div>");
		$("#explosao2").css("background-image", "url(imgs/explosao.png)");
		var div2=$("#explosao2");
		div2.css("top", inimigo2Y);
		div2.css("left", inimigo2X);
		div2.animate({width:200, opacity:0}, "slow");
	
		var tempoExplosao2=window.setInterval(removeExplosao2, 1000);
	
		function removeExplosao2() 
		{
			div2.remove();
			window.clearInterval(tempoExplosao2);
			tempoExplosao2=null;
		}
		
	} // Fim da função explosao2()

	//Reposiciona Amigo
	
	function reposicionaAmigo() 
	{
		var tempoAmigo=window.setInterval(reposiciona6, 6000);
		
		function reposiciona6() 
		{
			window.clearInterval(tempoAmigo);
			tempoAmigo = null;
		
			if (fimdejogo==false)
			{			
				$("#fundoGame").append("<div id='amigo' class='anima3'></div>");
				
				$("#foto2").show();
				exibeAmigos();
			}
		
		}

	} // Fim da função reposicionaAmigo()
	
	//Explosão3
	
	function explosao3(amigoX,amigoY)
	{
		somPerdido.play();
		
		$("#fundoGame").append("<div id='explosao3' class='anima4'></div>");
		$("#explosao3").css("top",amigoY);
		$("#explosao3").css("left",amigoX);
		
		var tempoExplosao3=window.setInterval(resetaExplosao3, 1000);
		
		function resetaExplosao3() 
		{
			$("#explosao3").remove();
			window.clearInterval(tempoExplosao3);
			tempoExplosao3=null;	
		}

	} // Fim da função explosao3

	function placar() 
	{
		$("#placar").html("<h2> Pontos: " + pontos + " Salvos: " + salvos + " Perdidos: " + perdidos + "</h2>");
	
	} //fim da função placar()
	
	//Barra de energia

	function energia() 
	{
		if (energiaAtual==3) {
			
			$("#energia").css("background-image", "url(imgs/energia3.png)");
		}
	
		if (energiaAtual==2) {
			
			$("#energia").css("background-image", "url(imgs/energia2.png)");
		}
	
		if (energiaAtual==1) {
			
			$("#energia").css("background-image", "url(imgs/energia1.png)");
		}
	
		if (energiaAtual==0) {
			
			$("#energia").css("background-image", "url(imgs/energia0.png)");
			
			gameOver();
			//Game Over
		}
	
	} // Fim da função energia()
	
	
	//Função GAME OVER
	function gameOver() 
	{
		fimdejogo=true;
		musica.pause();
		somGameover.play();
		
		window.clearInterval(jogo.timer);
		jogo.timer=null;
		
		$("#jogador").remove();
		$("#inimigo1").remove();
		$("#inimigo2").remove();
		$("#amigo").remove();
		$("#foto1").remove();
		$("#foto2").remove();
		
		$("#fundoGame").append("<div id='fim'></div>");
		
		saida = '<h1> Game Over </h1><p>Sua pontuação foi: ' + pontos + '</p>';
		saida +='<div id=compartilhar onClick="compartilharPontos(\'' + pontos + '\');">' + '<h3>Compartilhar</h3></div>';
		saida +='<div id=reinicia onClick=reiniciaJogo()><h3>Jogar Novamente</h3></div>'
		
		$("#fim").html(saida);
		
	} // Fim da função gameOver();
	
	
	//Função que atualiza as posições das fotos
	function atualizaFotos()
	{
		var topo1 = parseInt($("#jogador").css("top"));
		$("#foto1").css("top",topo1+40);
		
		var topo2 = parseInt($("#amigo").css("top"));
		var esquerda = parseInt($("#amigo").css("left"));
		$("#foto2").css("top",topo2-30);
		$("#foto2").css("left",esquerda);
	} // Fim da função atualizaFotos()


} // Fim da função start

function reiniciaJogo() 
{
	somGameover.pause();
	$("#fim").remove();
	start();
	
} //Fim da função reiniciaJogo

//Função que compartilha a pontuação do Jogador
function compartilharPontos(pontos)
{
	
	var obj = {
		method: 'feed',
		redirect_uri: 'http://apps.facebook.com/resgateappwar',
		//picture:'https://cdn.pixabay.com/photo/2013/07/12/18/29/trophy-153395_960_720.png',
		caption: 'Resgate - O jogo em que você resgata os seus amigos do Facebook',
		description:'Eu consegui a seguinte pontuação:' + pontos + '. Você consegue me superar?'
	};

    function callback(response)
    {      
       reiniciaJogo ();
    }

    FB.ui(obj, callback);
}

//Função convidar
function convidar()
{
	FB.ui({
		  method: 'apprequests',
		  title: 'Resgate os seus Amigos do Facebook!!',
		  message: 'Eu estou jogando o Game que eu criei. Você quer jogar também?'
		  }); 
}

