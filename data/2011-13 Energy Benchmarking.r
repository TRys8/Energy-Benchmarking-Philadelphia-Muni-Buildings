energy_df <- read.csv("C://Users//TRyan//Documents//Code for Philly//Energy Benchmarking//2011-13 Philadelphia Municipal Building Energy Usage.csv", stringsAsFactors=F)

plot(x=energy_df$Year.Built, y=energy_df$Weather.Normalized.Source.EUI..kBtu.ft2.)
library(ggplot2)
qplot(data=subset(energy_df,Property.Id==2365631),x=Year,y=Weather.Normalized.Source.EUI..kBtu.ft2.,group=Property.Id,geom=c("point","line"))
qplot(data=energy_df,x=Year,y=Weather.Normalized.Source.EUI..kBtu.ft2.,group=Property.Id,geom=c("point","line"))

energy_df_2011 <- subset(energy_df[,c("Property.Id","Weather.Normalized.Source.EUI..kBtu.ft2.","Year")],Year == 2011)
energy_df_2012 <- subset(energy_df[,c("Property.Id","Weather.Normalized.Source.EUI..kBtu.ft2.","Year")],Year == 2012)
energy_df_2013 <- subset(energy_df[,c("Property.Id","Weather.Normalized.Source.EUI..kBtu.ft2.","Year")],Year == 2013)
energy_df_2011_2012 <- merge(x=energy_df_2011,y=energy_df_2012,"Property.Id")
energy_df_2011_2013 <- merge(x=energy_df_2011_2012,y=energy_df_2013,"Property.Id")
energy_df_2011_2013$Year.x <- NULL
energy_df_2011_2013$Year.y <- NULL
energy_df_2011_2013$Year <- NULL
names(energy_df_2011_2013) <- c("Property.Id","weui2011","weui2012","weui2013")
names(energy_df_2011_2013)
