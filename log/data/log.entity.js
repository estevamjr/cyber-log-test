const { Entity, PrimaryGeneratedColumn, Column } = require('typeorm');

@Entity('matches')
class Match {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', unique: true })
  matchId;

  @Column({ type: 'jsonb' })
  report;
}

module.exports = { Match };