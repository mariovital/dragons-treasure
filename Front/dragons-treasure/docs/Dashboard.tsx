
import { FunctionComponent } from 'react';
import styles from './Dashboard.module.css';


const Dashboard:FunctionComponent = () => {
  	return (
    		<div className={styles.dashboard}>
      			<div className={styles.background}>
        				<img className={styles.elementosAulify501} alt="" src="Elementos Aulify-50 1.png" />
      			</div>
      			<div className={styles.fondos}>
        				<div className={styles.fondo} />
        				<div className={styles.elementosAulify}>
          					<img className={styles.elementosAulify351} alt="" src="Elementos Aulify-35 1.png" />
          					<img className={styles.elementosAulify271} alt="" src="Elementos Aulify-27 1.png" />
          					<img className={styles.elementosAulify451} alt="" src="Elementos Aulify-45 1.png" />
          					<img className={styles.elementosAulify211} alt="" src="Elementos Aulify-21 1.png" />
          					<img className={styles.elementosAulify071} alt="" src="Elementos Aulify-07 1.png" />
          					<img className={styles.elementosAulify381} alt="" src="Elementos Aulify-38 1.png" />
          					<img className={styles.elementosAulify281} alt="" src="Elementos Aulify-28 1.png" />
          					<img className={styles.elementosAulify431} alt="" src="Elementos Aulify-43 1.png" />
          					<img className={styles.elementosAulify171} alt="" src="Elementos Aulify-17 1.png" />
          					<img className={styles.elementosAulify411} alt="" src="Elementos Aulify-41 1.png" />
          					<img className={styles.elementosAulify111} alt="" src="Elementos Aulify-11 1.png" />
        				</div>
        				<div className={styles.fondosChild} />
      			</div>
      			<div className={styles.login}>
        				<div className={styles.dashboard1}>Dashboard</div>
      			</div>
      			<div className={styles.tiempoDeJuego}>
        				<div className={styles.tiempoDeJuego1}>Tiempo de Juego</div>
        				<div className={styles.nbchartsLinechats}>
          					<img className={styles.horizontalLinesIcon} alt="" src="Horizontal Lines.svg" />
          					<img className={styles.verticalLinesIcon} alt="" src="Vertical Lines.svg" />
          					<div className={styles.leftText}>
            						<div className={styles.div}>0</div>
            						<div className={styles.div1}>1</div>
            						<div className={styles.div2}>3</div>
            						<div className={styles.div3}>5</div>
            						<div className={styles.div4}>7</div>
          					</div>
          					<div className={styles.bottomText}>
            						<div className={styles.lunes}>Lunes</div>
            						<div className={styles.martes}>martes</div>
            						<div className={styles.mircoles}>miércoles</div>
            						<div className={styles.jueves}>jueves</div>
            						<div className={styles.viernes}>viernes</div>
            						<div className={styles.sbado}>sábado</div>
            						<div className={styles.domingo}>domingo</div>
          					</div>
          					<img className={styles.lineArea} alt="" src={`line & Area.svg`} />
          					<img className={styles.pointsIcon} alt="" src="Points.svg" />
        				</div>
      			</div>
      			<div className={styles.leaderboard}>
        				<div className={styles.fondo1} />
        				<div className={styles.sof}>🥈 1:44:10 Sofí</div>
        				<div className={styles.diana}>🥉 1:44:10 Diana</div>
        				<div className={styles.santiago}>➍ 1:44:10 Santiago</div>
        				<div className={styles.hugo}>➎ 1:44:10 Hugo</div>
        				<div className={styles.luan}>🥇 1:44:10 Luan</div>
        				<div className={styles.leaderboard1}>Leaderboard</div>
      			</div>
      			<div className={styles.dashboardChild} />
      			<div className={styles.dashboardUser}>
        				<div className={styles.fondo2} />
        				<div className={styles.dashboardText}>
          					<div className={styles.dashboard2}>Dashboard</div>
          					<img className={styles.dashboardIcon} alt="" src="dashboard.svg" />
        				</div>
        				<div className={styles.estadsticas}>
          					<div className={styles.estadsticas1}>Estadísticas</div>
          					<img className={styles.queryStatsIcon} alt="" src="query-stats.svg" />
        				</div>
        				<div className={styles.configuracion}>
          					<div className={styles.configuracin}>Configuración</div>
          					<img className={styles.queryStatsIcon} alt="" src="settings-account-box.svg" />
        				</div>
        				<div className={styles.salir}>
          					<div className={styles.salir1}>Salir</div>
          					<img className={styles.queryStatsIcon} alt="" src="close-rounded.svg" />
        				</div>
        				<div className={styles.usuario}>Usuario</div>
        				<img className={styles.sticker031Icon} alt="" src="Sticker-03 1.png" />
        				<img className={styles.recurso121001} alt="" src="Recurso 12-100 1.png" />
        				<div className={styles.bienvenido}>Bienvenido,</div>
        				<div className={styles.darkMode}>Dark Mode</div>
        				<img className={styles.darkModeOutlineIcon} alt="" src="dark-mode-outline.svg" />
      			</div>
      			<div className={styles.nivel}>
        				<div className={styles.fondo3} />
        				<div className={styles.nivel1}>Nivel</div>
        				<div className={styles.div5}>1</div>
        				<div className={styles.div6}>2</div>
        				<img className={styles.starsIcon} alt="" src="stars.svg" />
        				<div className={styles.puntosParaSubir}>5 puntos para subir</div>
        				<img className={styles.arrowRightAltRoundedIcon} alt="" src="arrow-right-alt-rounded.svg" />
        				<div className={styles.awardStarRounded} />
        				<img className={styles.vectorIcon} alt="" src="Vector.svg" />
      			</div>
      			<div className={styles.ultimas5Partidas}>
        				<div className={styles.fondo4} />
        				<div className={styles.div7}>
          					<span className={styles.span}>{`🥇    `}</span>
          					<span className={styles.span1}>{`1:44:10 `}</span>
        				</div>
        				<div className={styles.div8}>
          					<span className={styles.span}>{`❌    `}</span>
          					<span className={styles.span1}>{`3:05:50 `}</span>
        				</div>
        				<div className={styles.div9}>
          					<span className={styles.span}>{`🥈    `}</span>
          					<span className={styles.span1}>{`1:50:20 `}</span>
        				</div>
        				<div className={styles.div10}>
          					<span className={styles.span}>{`🥉    `}</span>
          					<span className={styles.span1}>{`2:00:40 `}</span>
        				</div>
        				<div className={styles.div11}>
          					<span className={styles.span}>{`❌    `}</span>
          					<span className={styles.span1}>{`2:30:22 `}</span>
        				</div>
        				<div className={styles.ltimas5Partidas}>Últimas 5 partidas.</div>
      			</div>
    		</div>);
};

export default Dashboard;

