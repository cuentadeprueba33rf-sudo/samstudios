import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MovieCard } from './components/MovieCard';
import { MovieRow } from './components/MovieRow';
import { AddMovieModal } from './components/AddMovieModal';
import { Player } from './components/Player';
import { SplashScreen } from './components/SplashScreen';
import { TopActorsRow } from './components/TopActorsRow';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LoginModal } from './components/LoginModal'; 
import { Movie, ViewState } from './types';
import { Play, Info, Construction, MessageSquarePlus, Database, Loader2, Grid3X3 } from 'lucide-react';
import { supabase } from './services/supabaseClient'; 

// INITIAL DATA - SEED DATA
const INITIAL_MOVIES: Movie[] = [
  // HERO MOVIE (Featured)
  {
    id: 'avatar-fire-ash',
    title: 'Avatar: Fire and Ash',
    description: 'Jake Sully y Neytiri se enfrentan a una nueva amenaza en Pandora: el Pueblo de la Ceniza, un clan Na\'vi volcánico agresivo que desafía todo lo que conocen sobre el equilibrio de la naturaleza.',
    year: '2025',
    genre: ['Sci-Fi', 'Aventura', 'Acción', 'Epica'],
    posterUrl: 'https://lumiere-a.akamaihd.net/v1/images/corl3_001a_g_spa-es_68_ec27b02a.jpeg?region=0,990,2700,2700',
    rating: 9.8,
    director: 'James Cameron',
    actors: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver'],
    streamUrl: 'https://ww1.123flmsfree.com/es/detail/movie/sGtHW7ACJjjeotuTAShSX-Avatar-Fire-and-Ash',
    imdbId: 'tt12345678'
  },
  // TRENDING #1
  {
    id: 'stranger-things-5',
    title: 'Stranger Things 5',
    description: 'La batalla final comienza. El grupo de Hawkins debe unirse una última vez para destruir a Vecna y cerrar el Upside Down para siempre, aunque el sacrificio podría ser devastador.',
    year: '2025',
    genre: ['Serie', 'Sci-Fi', 'Terror', 'Aventura'],
    posterUrl: 'https://static.wikia.nocookie.net/doblaje/images/1/15/Stranger_Things_5_P%C3%B3ster_final.jpg/revision/latest?cb=20260102172555&path-prefix=es',
    rating: 9.9,
    director: 'The Duffer Brothers',
    actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Noah Schnapp'],
    streamUrl: 'https://flixlat.com/es/detail/drama/1qHyRuA2AFyst4HAiATE3-Stranger-Things-Season-5/1',
    imdbId: 'tt4574334',
    trendingRank: 1
  },
  // TRENDING #2
  {
    id: 'el-gran-diluvio',
    title: 'El Gran Diluvio',
    description: 'Tras una inundación catastrófica que sumerge gran parte de la civilización, una madre emprende un viaje peligroso a través de un Londres irreconocible para reencontrarse con su familia.',
    year: '2025',
    genre: ['Película', 'Drama', 'Suspenso', 'Supervivencia'],
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq26tkghEUs37_qfB3Ydfzx50pQuA4l8I5D6BhmE7QjDP1dSOjT6PNMMOc&s=10',
    rating: 8.3,
    director: 'Mahalia Belo',
    actors: ['Jodie Comer', 'Joel Fry'],
    streamUrl: 'https://latino.solo-latino.com/es/detail/movie/jDSwryC0HLfgZgdJEE6uv-The-Great-Flood',
    imdbId: 'tt12345',
    trendingRank: 2
  },
  // TRENDING #3
  {
    id: 'estado-de-fuga',
    title: 'Estado de fuga: 1986',
    description: 'En el caos de 1986, una serie de eventos inexplicables sacude una pequeña comunidad. Secretos gubernamentales y fenómenos extraños chocan en este thriller de época.',
    year: '2025',
    genre: ['Serie', 'Thriller', 'Misterio', 'Drama'],
    posterUrl: 'https://www.mariomendoza.com.co/wp-content/uploads/2025/12/estado_de_fuga_1986.jpg',
    rating: 9.1,
    director: 'Mario Mendoza',
    actors: ['Desconocido', 'Elenco Local'],
    streamUrl: 'https://play.cuevana.life/es/detail/drama/mGbLIaxn3FA5TAZdnqXkC-Estado-de-fuga-1986/1',
    imdbId: 'tt_fuga',
    trendingRank: 3
  },
  // TRENDING #4
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    description: 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica, explorando la paradoja de arriesgarse a destruir el mundo para salvarlo.',
    year: '2023',
    genre: ['Película', 'Biografía', 'Drama', 'Historia'],
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWA6nftVT4gBriNjG_ecODX7gB-6Bw4ekZKl9PurGdGGhxev5Vk6tigQc&s=10',
    rating: 9.5,
    director: 'Christopher Nolan',
    actors: ['Cillian Murphy', 'Robert Downey Jr.', 'Emily Blunt'],
    streamUrl: 'https://www3.dramasfree.com/es/detail/movie/5iNrSCRpwFMNJxUshRpAj-Oppenheimer',
    imdbId: 'tt15398776',
    trendingRank: 4
  },
  // TRENDING #5
  {
    id: 'beso-dinamita',
    title: 'Beso Dinamita',
    description: 'Una comedia romántica explosiva donde el amor y el peligro van de la mano. Dos agentes rivales deben fingir ser pareja para detener una conspiración global.',
    year: '2025',
    genre: ['Serie', 'Acción', 'Romance', 'Comedia'],
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvNrgjwavV7ulG4Erq1oV2QyZl5gX6f9Q7r8t9u0i1o2p3a4s5d6f7g8h9j0k&s=10',
    rating: 8.7,
    director: 'Desconocido',
    actors: ['Actores Asiáticos Populares'],
    streamUrl: 'https://www3.dramasfree.com/es/detail/drama/xQ7HiLVHwvNMFDlYm7N0f-Dynamite-Kiss/1',
    imdbId: 'tt_dynamite',
    trendingRank: 5
  },
  // TRENDING #6
  {
    id: 'zootopia-2',
    title: 'Zootopia 2',
    description: 'Judy Hopps y Nick Wilde regresan para patrullar las calles y descubrir un nuevo misterio que amenaza la paz entre depredadores y presas en la metrópolis.',
    year: '2025',
    genre: ['Película', 'Animación', 'Aventura', 'Comedia'],
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BOWNmZGQ0OTktMDIyZS00YjJkLTg5MTEtZTk2NGM4NTM5MDE2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    rating: 8.5,
    director: 'Byron Howard',
    actors: ['Ginnifer Goodwin', 'Jason Bateman'],
    streamUrl: 'https://es.cuevana4br.com/es/detail/movie/OmKA0o94bf16x4RsPNud1-Zootopia-2',
    imdbId: 'tt987654',
    trendingRank: 6
  },
  // TRENDING #7
  {
    id: 'welcome-to-derry',
    title: 'It: Welcome to Derry',
    description: 'Ambientada en los años 60, esta precuela explora los orígenes de la maldición que acecha a la pequeña ciudad de Derry y el despertar del terrorífico Pennywise.',
    year: '2025',
    genre: ['Serie', 'Terror', 'Suspenso'],
    posterUrl: 'https://images.justwatch.com/poster/337882384/s718/welcome-to-derry.jpg',
    rating: 8.8,
    director: 'Andy Muschietti',
    actors: ['Taylour Paige', 'Jovan Adepo', 'Bill Skarsgård'],
    streamUrl: 'https://latino.solo-latino.com/es/detail/drama/YIbEmf0CEN7cHMhfUqX8W-IT-Welcome-to-Derry-Season-1',
    imdbId: 'tt1928374',
    trendingRank: 7
  },
  // TRENDING #8
  {
    id: 'fnaf-2',
    title: 'Five Nights at Freddy\'s 2',
    description: 'Nuevos animatrónicos, nuevos guardias de seguridad y los mismos terrores nocturnos. La pizzería reabre sus puertas con secretos más oscuros que nunca.',
    year: '2025',
    genre: ['Película', 'Terror', 'Misterio'],
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZmQ3NmIxNTgtYjFiNS00NzliLWI0YzAtZDkxY2E0YWIxZDEwXkEyXkFqcGc@._V1_.jpg',
    rating: 8.2,
    director: 'Emma Tammi',
    actors: ['Josh Hutcherson', 'Matthew Lillard'],
    streamUrl: 'https://latino.solo-latino.com/es/detail/movie/QyFLAM7pTw8mzvuli420k-Five-Nights-At-Freddys-2',
    imdbId: 'tt234567',
    trendingRank: 8
  },
  // TRENDING #9
  {
    id: 'emily-in-paris-5',
    title: 'Emily in Paris: Temporada 5',
    description: 'Emily Cooper se embarca en nuevas aventuras románticas y profesionales que la llevan desde París a Roma, enfrentando decisiones que cambiarán su vida para siempre.',
    year: '2025',
    genre: ['Serie', 'Romance', 'Comedia', 'Drama'],
    posterUrl: 'https://dnm.nflximg.net/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABUB2JtxWcz_bBS7OQuwsp2x8FbE06run3q4G9FaY9VYMc9oMO7ycPcQwc19j4gz5-xY1X298MLv65uHY-Y7_EVxT2uHRELUejOBQ.jpg?r=77e',
    rating: 8.9,
    director: 'Darren Star',
    actors: ['Lily Collins', 'Lucas Bravo'],
    streamUrl: 'https://flixlat.com/es/detail/drama/LITQaiwYOhNPTTbLguBKt-Emily-in-Paris-Season-5/1',
    imdbId: 'tt112233',
    trendingRank: 9
  },
  // TRENDING #10
  {
    id: 'conjuro-4',
    title: 'El Conjuro 4: Last Rites',
    description: 'Los investigadores paranormales Ed y Lorraine Warren se enfrentan a su caso más personal y aterrador hasta la fecha, poniendo a prueba su fe y su amor.',
    year: '2025',
    genre: ['Película', 'Terror', 'Sobrenatural'],
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmU0NzZhYTItOWEyMy00YWE5LTljZjgtOGJhYmIwNDI5NjNiXkEyXkFqcGc@._V1_.jpg',
    rating: 8.6,
    director: 'Michael Chaves',
    actors: ['Patrick Wilson', 'Vera Farmiga'],
    streamUrl: 'https://ww1.123flmsfree.com/es/detail/movie/ES2bt710owMqhlGaMAzdC-The-Conjuring-Last-Rites',
    imdbId: 'tt90123',
    trendingRank: 10
  },
  // OTHERS
  {
    id: 'greenland',
    title: 'Greenland: El último refugio',
    description: 'Una familia lucha por sobrevivir mientras un cometa destructor de planetas se dirige a la Tierra, buscando desesperadamente un refugio seguro.',
    year: '2020',
    genre: ['Película', 'Acción', 'Thriller', 'Catástrofe'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/20/06/25/15/00/3011978.jpg',
    rating: 7.8,
    director: 'Ric Roman Waugh',
    actors: ['Gerard Butler', 'Morena Baccarin'],
    streamUrl: 'https://flixlat.com/es/detail/movie/AD4k3xefiFkSpnc9qj8JN-Greenland',
    imdbId: 'tt7737786'
  },
  {
    id: 'gladiator-2',
    title: 'Gladiador II',
    description: 'Años después de presenciar la muerte del venerado héroe Máximo, Lucio se ve obligado a entrar en el Coliseo tras ser capturado por los emperadores tiránicos que ahora gobiernan Roma.',
    year: '2024',
    genre: ['Acción', 'Aventura', 'Drama', 'Epica'],
    posterUrl: 'https://images.justwatch.com/poster/323139396/s718/gladiator-2.jpg',
    rating: 8.8,
    director: 'Ridley Scott',
    actors: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington'],
    streamUrl: 'https://play.cuevana.life/es/detail/movie/iRM7BeyDyMkpOwNPUjDzZ-Gladiator-2',
    imdbId: 'tt11052360'
  },
  {
    id: 'dune-part-two',
    title: 'Dune: Parte Dos',
    description: 'Paul Atreides se une a Chani y a los Fremen en una guerra de venganza contra los conspiradores que destruyeron a su familia.',
    year: '2024',
    genre: ['Sci-Fi', 'Aventura', 'Acción', 'Epica'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/24/02/20/17/42/2385575.jpg',
    rating: 9.6,
    director: 'Denis Villeneuve',
    actors: ['Timothée Chalamet', 'Zendaya', 'Austin Butler', 'Florence Pugh'],
    streamUrl: 'https://ww20.321moviesfree.com/es/detail/movie/5losFWBWLaFgPE7P8GGM1-Dune-Part-Two',
    imdbId: 'tt15239678'
  },
  {
    id: 'adolescencia-uk',
    title: 'Adolescencia (Adolescence)',
    description: 'Un niño de 13 años es arrestado por el asesinato de una compañera, desencadenando una investigación que expone fallas familiares y sociales.',
    year: '2025',
    genre: ['Serie', 'Drama', 'Crimen', 'Suspenso'],
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGY1YjBiNzMtYWZhNC00OWViLWE0MzItNjc4YzczOGNiM2I0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    rating: 8.9,
    director: 'Philip Barantini',
    actors: ['Stephen Graham', 'Owen Cooper', 'Ashley Walters', 'Erin Doherty'],
    streamUrl: 'https://video.playspelis.com/es/detail/drama/vAE5lIFzbBEevll3D9GDq-Adolescence/1',
    imdbId: 'tt022'
  },
  {
    id: 'baby-serie',
    title: 'Baby',
    description: 'Un grupo de adolescentes de la élite de Roma lleva una doble vida secreta que rompe con las apariencias.',
    year: '2018',
    genre: ['Serie', 'Drama', 'Romance', 'Juvenil'],
    posterUrl: 'https://es.web.img2.acsta.net/pictures/20/08/26/09/34/3778371.jpg',
    rating: 9.1,
    director: 'Andrea De Sica',
    actors: ['Benedetta Porcaroli', 'Alice Pagani', 'Lorenzo Zurzolo'],
    streamUrl: 'https://video.playspelis.com/es/detail/drama/9q67azHdkQhQO63czfTqS-Baby-Season-1',
    imdbId: 'tt021'
  },
  {
    id: 'merlina',
    title: 'Merlina',
    description: 'Inteligente, sarcástica y un poco muerta por dentro, Merlina Addams investiga una ola de asesinatos mientras hace nuevos amigos (y enemigos) en la Academia Nunca Más.',
    year: '2022',
    genre: ['Serie', 'Fantasía', 'Comedia', 'Crimen'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/22/09/26/16/09/0638363.jpg',
    rating: 8.5,
    director: 'Tim Burton',
    actors: ['Jenna Ortega', 'Emma Myers'],
    streamUrl: 'https://www.netflix.com/title/81231974',
    imdbId: 'tt13443470'
  },
  {
    id: 'euphoria',
    title: 'Euphoria',
    description: 'Un grupo de estudiantes de secundaria navega entre drogas, relaciones sexuales, traumas, redes sociales, amor y amistad.',
    year: '2019',
    genre: ['Serie', 'Drama', 'Juvenil'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/19/07/02/10/58/5623086.jpg',
    rating: 8.8,
    director: 'Sam Levinson',
    actors: ['Zendaya', 'Hunter Schafer', 'Jacob Elordi'],
    streamUrl: 'https://www.hbo.com/euphoria',
    imdbId: 'tt8772296'
  },
  {
    id: 'after-movie',
    title: 'After: Aquí empieza todo',
    description: 'Tessa Young es una estudiante dedicada, hija obediente y novia fiel. Sin embargo, su mundo protegido se abre cuando conoce a Hardin Scott.',
    year: '2019',
    genre: ['Romance', 'Drama', 'Juvenil'],
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmdQ6CCaqo0PlDx0vpZMeNAXVJ4obQor4j4hbVIVS8VQ&s=10',
    rating: 6.5,
    director: 'Jenny Gage',
    actors: ['Josephine Langford', 'Hero Fiennes Tiffin'],
    streamUrl: 'https://flixlat.com/es/detail/movie/JRjYh6gw5mCfKommle2fE-After',
    imdbId: 'tt4126476'
  },
  {
    id: 'culpa-nuestra',
    title: 'Culpa Nuestra',
    description: 'Noah y Nick enfrentan las consecuencias de su relación y deben decidir si su amor puede sobrevivir a los conflictos que los separan.',
    year: '2025',
    genre: ['Película', 'Romance', 'Drama'],
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvPL_TZGNX-V3pY0V09ALEXTRjBkRPBHoPfeNK_c0KIgbkpwBQzWfFL5k1&s=10',
    rating: 9.4,
    director: 'Domingo González',
    actors: ['Nicole Wallace', 'Gabriel Guevara'],
    streamUrl: 'https://ver.123pelicula.com/es/detail/movie/MOxrJlmYEUdZSivZRlkFG-Our-Fault',
    imdbId: 'tt020'
  },
  {
    id: 'the-notebook',
    title: 'Diario de una pasión',
    description: 'Un hombre pobre pero apasionado se enamora de una joven rica, dándole una sensación de libertad, pero pronto son separados por sus diferencias sociales.',
    year: '2004',
    genre: ['Romance', 'Drama'],
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BM2RiMzcxYmYtNzQ3MC00NTQ4LWE0ZjktNGUwODI1MzhjNDNkXkEyXkFqcGc@._V1_.jpg',
    rating: 7.8,
    director: 'Nick Cassavetes',
    actors: ['Ryan Gosling', 'Rachel McAdams'],
    streamUrl: 'https://play.cuevana.life/es/detail/movie/OKYKswaY9RAWstUx7M3xB-The-Notebook',
    imdbId: 'tt0332280'
  },
  {
    id: 'bajo-misma-estrella',
    title: 'Bajo la misma estrella',
    description: 'Dos adolescentes pacientes de cáncer inician un viaje de afirmación de vida para visitar a un autor solitario en Ámsterdam.',
    year: '2014',
    genre: ['Drama', 'Romance'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/14/02/05/16/10/034641.jpg',
    rating: 7.7,
    director: 'Josh Boone',
    actors: ['Shailene Woodley', 'Ansel Elgort'],
    streamUrl: 'https://latino.solo-latino.com/es/detail/movie/5cxpe224q7YWLSzXLxfsS-Dil-Bechara',
    imdbId: 'tt2582846'
  },
  {
    id: 'to-all-the-boys',
    title: 'A todos los chicos de los que me enamoré',
    description: 'Las cartas de amor secretas de Lara Jean se envían accidentalmente a cada uno de sus enamorados, desatando el caos en su vida amorosa.',
    year: '2018',
    genre: ['Romance', 'Comedia', 'Juvenil'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/18/08/07/17/37/1151670.jpg',
    rating: 7.1,
    director: 'Susan Johnson',
    actors: ['Lana Condor', 'Noah Centineo'],
    streamUrl: 'https://www.netflix.com/title/80203147',
    imdbId: 'tt3846674'
  },
  {
    id: 'anyone-but-you',
    title: 'Con todos menos contigo',
    description: 'A pesar de una primera cita increíble, la atracción inicial de Bea y Ben se vuelve agria. Sin embargo, se reencuentran inesperadamente en una boda en Australia.',
    year: '2023',
    genre: ['Romance', 'Comedia'],
    posterUrl: 'https://es.web.img3.acsta.net/pictures/23/10/20/10/37/4639906.jpg',
    rating: 6.4,
    director: 'Will Gluck',
    actors: ['Sydney Sweeney', 'Glen Powell'],
    streamUrl: 'https://play.cuevana.life/es/detail/movie/84j7qG1tF9e2L6oP3rK5-Anyone-But-You',
    imdbId: 'tt26047818'
  },
  {
    id: 'la-sociedad-de-la-nieve',
    title: 'La Sociedad de la Nieve',
    description: 'En 1972, el vuelo 571 de la Fuerza Aérea Uruguaya, fletado para llevar a un equipo de rugby a Chile, se estrella en el corazón de los Andes.',
    year: '2023',
    genre: ['Drama', 'Aventura', 'Thriller'],
    posterUrl: 'https://es.web.img2.acsta.net/pictures/23/11/29/17/04/1043324.jpg',
    rating: 7.9,
    director: 'J.A. Bayona',
    actors: ['Enzo Vogrincic', 'Matías Recalt'],
    streamUrl: 'https://www.netflix.com/title/81268316',
    imdbId: 'tt16277242'
  }
];

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Use localStorage to check if disclaimer was already accepted
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('samstudios_disclaimer_v1') === 'true';
    }
    return false;
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // State for Movies
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [usingLocalData, setUsingLocalData] = useState(true); // Track if we are using hardcoded data
  const [syncLoading, setSyncLoading] = useState(false);
  
  const [myList, setMyList] = useState<string[]>([]);
  const [likedMovies, setLikedMovies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth State
  const [session, setSession] = useState<any>(null);
  const isAdmin = !!session?.user;

  // 1. Check Auth on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMovies = async () => {
        const { data, error } = await supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            if (data.length > 5) {
                // If DB has significant data, USE DB ONLY. This fixes the deletion issue.
                setMovies(data);
                setUsingLocalData(false);
            } else {
                // If DB is empty or almost empty, merge or use local to show something
                // Priority Strategy: Supabase Data > Hardcoded Data
                const movieMap = new Map<string, Movie>();
                INITIAL_MOVIES.forEach(m => movieMap.set(m.id, m));
                data.forEach((m: any) => movieMap.set(m.id, m));
                setMovies(Array.from(movieMap.values()));
                setUsingLocalData(true); // Still relying on local data partially
            }
        } else {
            console.error("Error fetching movies:", error);
            setUsingLocalData(true);
        }
  };

  // 2. Fetch Movies from Supabase on Mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // NEW: Function to upload INITIAL_MOVIES to Supabase (One-time sync)
  const handleSyncCatalog = async () => {
      if (!confirm("Esto subirá todas las películas 'base' a tu base de datos Supabase. ¿Continuar?")) return;
      
      setSyncLoading(true);
      try {
          // Prepare data: Remove 'id' so Supabase generates unique UUIDs to avoid conflicts
          // Or keep IDs if they are valid text, but safer to let Supabase handle if they are new
          
          // Current strategy: Upsert based on Title to avoid duplicates if run twice
          const moviesToUpload = INITIAL_MOVIES.map(m => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...rest } = m; // Remove ID to allow new UUID generation or handle externally
              return {
                  ...rest,
                  // We need to ensure required fields for Supabase match the Typescript type
                  genre: m.genre || [],
                  actors: m.actors || []
              };
          });

          // Insert one by one or bulk. Using upsert on ID won't work if IDs are different.
          // We will attempt to insert. If exact title exists, we skip? 
          // Simplest for "Free Cloud": Just Insert.
          
          for (const movie of moviesToUpload) {
             // Check if exists by title to avoid duplicates
             const { data } = await supabase.from('movies').select('id').eq('title', movie.title).single();
             if (!data) {
                 await supabase.from('movies').insert(movie);
             }
          }
          
          alert("¡Catálogo sincronizado con éxito! Ahora tus cambios serán permanentes.");
          fetchMovies(); // Reload to switch to DB-only mode

      } catch (e: any) {
          alert("Error sincronizando: " + e.message);
      } finally {
          setSyncLoading(false);
      }
  };

  const filteredMovies = useMemo(() => {
    if (!searchTerm) return movies;
    return movies.filter(m => 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [movies, searchTerm]);

  // Construct the specific Trending List dynamically based on ranking
  const trendingMovies = useMemo(() => {
    return movies
      .filter(m => m.trendingRank && m.trendingRank > 0)
      .sort((a, b) => (a.trendingRank || 100) - (b.trendingRank || 100))
      .slice(0, 10);
  }, [movies]);

  const myListMovies = useMemo(() => {
    return movies.filter(m => myList.includes(m.id));
  }, [movies, myList]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView(ViewState.PLAYER);
  };

  const handleEditMovie = (movie: Movie) => {
      setSelectedMovie(movie);
      setCurrentView(ViewState.EDIT_MOVIE);
  };

  const handleSaveMovie = (savedMovie: Movie) => {
    // Optimistic update
    setMovies(prev => {
        const exists = prev.find(m => m.id === savedMovie.id);
        if (exists) {
            return prev.map(m => m.id === savedMovie.id ? savedMovie : m);
        }
        return [savedMovie, ...prev];
    });
    // If we were editing, go back to player to see changes
    if (currentView === ViewState.EDIT_MOVIE) {
        setSelectedMovie(savedMovie);
        setCurrentView(ViewState.PLAYER);
    }
    // Re-fetch to ensure sync with DB (ID generation etc)
    fetchMovies();
  };

  const handleDeleteMovie = async (movieId: string) => {
      // 1. Delete from Supabase
      const { error } = await supabase.from('movies').delete().eq('id', movieId);
      
      if (error) {
          throw new Error(error.message);
      }

      // 2. Remove from Local State immediately
      setMovies(prev => prev.filter(m => m.id !== movieId));
      
      // 3. Reset View
      setSelectedMovie(null);
      setCurrentView(ViewState.HOME);
  };

  const toggleMyList = (movieId: string) => {
    setMyList(prev => prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]);
  };

  const toggleLike = (movieId: string) => {
    setLikedMovies(prev => prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
  };

  // Handle Accept Disclaimer
  const handleAcceptDisclaimer = () => {
      localStorage.setItem('samstudios_disclaimer_v1', 'true');
      setDisclaimerAccepted(true);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!disclaimerAccepted) {
    return <DisclaimerModal onAccept={handleAcceptDisclaimer} />;
  }

  if (currentView === ViewState.PLAYER && selectedMovie) {
    return (
      <Player 
        movie={selectedMovie}
        allMovies={movies}
        onBack={() => setCurrentView(ViewState.HOME)}
        onMovieClick={handleMovieClick}
        isLiked={likedMovies.includes(selectedMovie.id)}
        isInMyList={myList.includes(selectedMovie.id)}
        onToggleLike={() => toggleLike(selectedMovie.id)}
        onToggleMyList={() => toggleMyList(selectedMovie.id)}
        isAdmin={isAdmin}
        onEdit={handleEditMovie}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar 
        onAddClick={() => { setSelectedMovie(null); setCurrentView(ViewState.ADD_MOVIE); }}
        onHomeClick={() => { setCurrentView(ViewState.HOME); setSearchTerm(''); }}
        onMyListClick={() => setCurrentView(ViewState.MY_LIST)}
        onUserClick={() => isAdmin ? handleLogout() : setCurrentView(ViewState.LOGIN)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isAdmin={isAdmin}
      />

      {currentView === ViewState.LOGIN && (
        <LoginModal 
            onClose={() => setCurrentView(ViewState.HOME)}
            onLoginSuccess={() => setCurrentView(ViewState.HOME)}
        />
      )}

      {(currentView === ViewState.ADD_MOVIE || currentView === ViewState.EDIT_MOVIE) && (
        <AddMovieModal 
          onClose={() => currentView === ViewState.EDIT_MOVIE ? setCurrentView(ViewState.PLAYER) : setCurrentView(ViewState.HOME)}
          onAdd={handleSaveMovie}
          onDelete={handleDeleteMovie}
          movieToEdit={currentView === ViewState.EDIT_MOVIE ? selectedMovie : null}
        />
      )}

      {currentView === ViewState.MY_LIST ? (
        <div className="pt-24 px-4 sm:px-8 min-h-screen">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Mi Lista</h2>
            {myListMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {myListMovies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                    <p className="text-lg">Tu lista está vacía</p>
                </div>
            )}
        </div>
      ) : (
        <>
           {/* ADMIN DASHBOARD BANNER */}
           {isAdmin && usingLocalData && !searchTerm && (
             <div className="pt-20 px-4 md:px-8">
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-blue-400" />
                        <div>
                            <h3 className="font-bold text-white">Modo Mixto Detectado</h3>
                            <p className="text-sm text-gray-400">Las películas base están en el código. Si las borras, volverán. Sincroniza para moverlas a la base de datos.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSyncCatalog}
                        disabled={syncLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        {syncLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Database className="h-4 w-4" />}
                        Sincronizar Catálogo
                    </button>
                </div>
             </div>
           )}

           {!searchTerm && (
             <div className="relative h-[70vh] md:h-[85vh] w-full">
                {(() => {
                    const featured = movies[0]; // HERO (Avatar) or First Fetched
                    if (!featured) return null;
                    return (
                        <>
                            <div className="absolute inset-0">
                                <img src={featured.posterUrl} className="w-full h-full object-cover" alt={featured.title} />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                            </div>
                            <div className="absolute bottom-[20%] left-4 md:left-12 max-w-xl space-y-4 animate-fade-in-up">
                                <h1 className="text-4xl md:text-7xl font-black drop-shadow-2xl">{featured.title}</h1>
                                <p className="text-base md:text-xl drop-shadow-md line-clamp-3 text-gray-200">{featured.description}</p>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => handleMovieClick(featured)}
                                        className="bg-white text-black px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-gray-200 transition-colors shadow-lg"
                                    >
                                        <Play className="fill-black h-5 w-5" /> Ver Ahora
                                    </button>
                                    <button 
                                        onClick={() => handleMovieClick(featured)}
                                        className="bg-gray-500/40 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-gray-500/60 transition-colors backdrop-blur-md border border-white/10"
                                    >
                                        <Info className="h-5 w-5" /> Más Info
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                })()}
             </div>
           )}

           <div className={`relative z-10 pb-20 ${!searchTerm ? '-mt-24 md:-mt-32' : 'pt-24'}`}>
              
              {!searchTerm && (
                <>
                    {/* Construction Banner */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-yellow-500 rounded-r-lg p-4 shadow-lg flex items-start gap-4 animate-fade-in">
                            <div className="bg-yellow-500/10 p-2 rounded-full shrink-0">
                                <Construction className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm md:text-base">Catálogo en Construcción</h3>
                                <p className="text-gray-400 text-xs md:text-sm mt-1">
                                    Aún no están todas las películas, pero estamos agregando contenido <strong>todos los días</strong>. 
                                </p>
                            </div>
                        </div>
                    </div>

                    <TopActorsRow isAdmin={isAdmin} />
                </>
              )}

              <div className="px-4 md:px-12 space-y-8 mt-8">
                 {searchTerm ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                        ))}
                     </div>
                 ) : (
                     <>
                        {/* DYNAMIC TRENDING ROW */}
                        {trendingMovies.length > 0 && (
                            <MovieRow title="Tendencias" movies={trendingMovies} onMovieClick={handleMovieClick} rank />
                        )}
                        
                        <MovieRow title="Novedades" movies={movies.filter(m => ['2025', '2024'].includes(m.year) && !m.trendingRank).slice(0, 10)} onMovieClick={handleMovieClick} />
                        <MovieRow title="Acción y Aventura" movies={movies.filter(m => m.genre.some(g => ['Acción', 'Aventura', 'Sci-Fi', 'Fantasía'].includes(g)))} onMovieClick={handleMovieClick} />
                        <MovieRow title="Romance" movies={movies.filter(m => m.genre.includes('Romance'))} onMovieClick={handleMovieClick} />
                        <MovieRow title="Dramas Aclamados" movies={movies.filter(m => m.genre.includes('Drama'))} onMovieClick={handleMovieClick} />

                        {/* FULL CATALOG GRID */}
                        <div className="pt-10 border-t border-white/10 mt-16">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 px-4 sm:px-6 lg:px-8">
                                <Grid3X3 className="h-6 w-6 text-brand-500" />
                                Explorar Todo el Catálogo
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 sm:px-6 lg:px-8">
                                {movies.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                                ))}
                            </div>
                        </div>
                     </>
                 )}
              </div>
           </div>
        </>
      )}
    </div>
  );
};

export default App;