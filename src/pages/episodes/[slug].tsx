import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link'
import Head from 'next/head'

import {format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import { PlayerContext } from '../../contexts/PlayerContext';
import styles from './episode.module.scss'

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({episode }:EpisodeProps){

  const { play } = useContext(PlayerContext)

  return(
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit='cover'
        />
        <button type="button" onClick={() => play(episode)} >
          <img src="/play.svg" alt="Tocar" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div 
      className={styles.description}
      dangerouslySetInnerHTML={{__html: episode.description}}
      />
        
      
    </div>
      )
}

export const getStaticPaths: GetStaticPaths = async () => {

 /*  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,//selecionar apenas os 2 últimos eps para gerar estaticamente
      _sort: 'published_at',
      _order: 'desc',
    },
  })

  const paths = data.map(episode => {
    return {
      params:{
        slug: episode.id
      }
    }
  })  */

  return{
    //carrega estaticamente as páginas no lado do servidor(no momento do click)
  paths:[],
  fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {

  const { slug} = ctx.params;
  const {data} = await api.get(`episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(
      Number(data.file.duration)
    ),
    description: data.description,
    url: data.file.url,
  };

    return { 
    props:{
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }

}